import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

def load_and_preprocess_data():
    # Cargar el conjunto de datos Iris
    iris = load_iris()
    df_iris = pd.DataFrame(data=iris.data, columns=iris.feature_names)
    df_iris['species'] = iris.target

    # Dividir en conjunto de entrenamiento y prueba
    X = df_iris.drop('species', axis=1)
    y = df_iris['species']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    return X_train, X_test, y_train, y_test

def train_model(X_train, y_train):
    # Entrenar el modelo
    model = LogisticRegression(max_iter=200)
    model.fit(X_train, y_train)
    
    # Guardar el modelo entrenado
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/logistic_regression_model.pkl')
    
    return model

def validate_model(model, X_test, y_test):
    # Hacer predicciones y evaluar el modelo
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    
    # Guardar el informe de evaluación
    os.makedirs('reports', exist_ok=True)
    with open('reports/classification_report.txt', 'w') as f:
        f.write(f'Precisión: {accuracy:.2f}\n\n')
        f.write(report)

    return accuracy, report

def main():
    # Cargar y preprocesar los datos
    X_train, X_test, y_train, y_test = load_and_preprocess_data()

    # Entrenar el modelo
    model = train_model(X_train, y_train)

    # Validar el modelo
    accuracy, report = validate_model(model, X_test, y_test)
    
    print(f'Modelo entrenado y validado con precisión: {accuracy:.2f}')
    print('Reporte de clasificación guardado en reports/classification_report.txt')

if __name__ == "__main__":
    main()