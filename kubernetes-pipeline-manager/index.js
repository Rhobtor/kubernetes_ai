const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const k8s = require('@kubernetes/client-node');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sBatchV1Api = kc.makeApiClient(k8s.BatchV1Api);
const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);

// Endpoint para listar pipelines (jobs)
app.get('/pipelines', async (req, res) => {
    try {
        const response = await k8sBatchV1Api.listNamespacedJob('default');
        res.json(response.body.items);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving pipelines');
    }
});

// Endpoint para crear un pipeline (job)
app.post('/pipelines', async (req, res) => {
    const { name } = req.body;
    const jobManifest = {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
            name: name,
        },
        spec: {
            template: {
                metadata: {
                    labels: {
                        app: 'pipeline',
                    },
                },
                spec: {
                    containers: [
                        {
                            name: 'pipeline',
                            image: 'rhobtor/iris-pipeline:latest',
                            command: ['python', 'run_pipeline.py'],
                        },
                    ],
                    restartPolicy: 'Never',
                },
            },
        },
    };

    try {
        const job = await k8sBatchV1Api.createNamespacedJob('default', jobManifest);
        res.json(job.body);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating job');
    }
});

// Endpoint para eliminar un pipeline (job)
app.delete('/pipelines/:name', async (req, res) => {
    const jobName = req.params.name;
    try {
        await k8sBatchV1Api.deleteNamespacedJob(jobName, 'default', {
            propagationPolicy: 'Foreground',
        });
        res.send(`Job ${jobName} deleted`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting job');
    }
});

// Endpoint para obtener logs de un pod
app.get('/pipelines/:name/logs', async (req, res) => {
    const jobName = req.params.name;
    try {
        const jobs = await k8sBatchV1Api.listNamespacedJob('default');
        const job = jobs.body.items.find(j => j.metadata.name === jobName);
        if (!job) {
            return res.status(404).send('Job not found');
        }
        const pods = await k8sCoreV1Api.listNamespacedPod('default', undefined, undefined, undefined, undefined, `job-name=${jobName}`);
        if (pods.body.items.length === 0) {
            return res.status(404).send('Pod not found');
        }
        const podName = pods.body.items[0].metadata.name;
        const logs = await k8sCoreV1Api.readNamespacedPodLog(podName, 'default');
        res.send(logs.body);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving logs');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
