import pandas as pd
from sklearn.tree import DecisionTreeClassifier


class SymptomChecker:

    def __init__(self):

        self.df = pd.read_csv("dataset/symptoms.csv")

        X = self.df.drop("disease", axis=1)

        y = self.df["disease"]

        self.model = DecisionTreeClassifier(random_state=42)

        self.model.fit(X, y)

    def predict(self, symptoms):

        prediction = self.model.predict([symptoms])[0]

        probability = self.model.predict_proba([symptoms])[0]

        confidence = round(max(probability) * 100, 2)

        return prediction, confidence