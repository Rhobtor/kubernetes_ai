from airflow import DAG
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator
from airflow.utils.dates import days_ago

default_args = {
    'retries': 1,
}

with DAG(
    dag_id='kubernetes_pod_operator_test',
    default_args=default_args,
    schedule_interval=None,
    start_date=days_ago(1),
    catchup=False,
) as dag:
    
    start_task = KubernetesPodOperator(
        task_id='start_task',
        name='start-task',
        namespace='default',
        image='busybox',
        cmds=["/bin/sh"],
        arguments=["-c", "echo Hello from the Kubernetes Pod!"],
        is_delete_operator_pod=True,
        get_logs=True,
    )
    
    start_task
