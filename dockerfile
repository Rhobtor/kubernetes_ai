# Imagen base
FROM python:3.9-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo de requerimientos y el script principal
COPY requirements.txt requirements.txt
COPY pipeline.py pipeline.py

# Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Ejecutar el pipeline
CMD ["python", "pipeline.py"]
