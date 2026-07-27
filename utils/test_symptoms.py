from prediction.symptom_checker import SymptomChecker
from prediction.recommendation import Recommendation

checker = SymptomChecker()
recommend = Recommendation()

symptoms = [
    1,  # headache
    1,  # fever
    1,  # cough
    0,  # dizziness
    1,  # body pain
    0,  # chest pain
    0   # vomiting
]

disease, confidence = checker.predict(symptoms)

info = recommend.get(disease)

print("=" * 40)
print("AI HEALTH REPORT")
print("=" * 40)
print("Disease      :", disease)
print("Confidence   :", confidence, "%")
print("Risk Level   :", info["risk"])
print("Diet         :", info["diet"])
print("Recommendation:", info["solution"])