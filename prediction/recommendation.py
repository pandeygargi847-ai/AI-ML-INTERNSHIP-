class Recommendation:

    def __init__(self):

        self.data = {

            "Viral Fever": {
                "risk": "Medium",
                "diet": "Drink fluids, fruits, soup",
                "solution": "Take rest and monitor temperature."
            },

            "Migraine": {
                "risk": "Low",
                "diet": "Hydrate well and avoid caffeine.",
                "solution": "Reduce screen time and rest."
            },

            "Common Cold": {
                "risk": "Low",
                "diet": "Warm liquids and vitamin C rich food.",
                "solution": "Steam inhalation and adequate rest."
            },

            "Influenza": {
                "risk": "Medium",
                "diet": "Soft food and plenty of water.",
                "solution": "Consult a doctor if symptoms worsen."
            },

            "Heart Disease": {
                "risk": "High",
                "diet": "Low-fat, low-salt diet.",
                "solution": "Seek immediate medical evaluation."
            },

            "Hypertension": {
                "risk": "Medium",
                "diet": "Reduce sodium intake.",
                "solution": "Regular exercise and blood pressure monitoring."
            },

            "Dengue": {
                "risk": "High",
                "diet": "Drink fluids and ORS.",
                "solution": "Consult a physician promptly."
            },

            "Typhoid": {
                "risk": "High",
                "diet": "Soft, hygienic meals.",
                "solution": "Medical treatment is recommended."
            },

            "Allergy": {
                "risk": "Low",
                "diet": "Avoid known allergens.",
                "solution": "Consult a doctor if symptoms persist."
            },

            "Food Poisoning": {
                "risk": "Medium",
                "diet": "ORS, fluids, bland food.",
                "solution": "Seek medical care if dehydration develops."
            }
        }

    def get(self, disease):

        return self.data.get(
            disease,
            {
                "risk": "Unknown",
                "diet": "Balanced diet",
                "solution": "Consult a healthcare professional."
            }
        )