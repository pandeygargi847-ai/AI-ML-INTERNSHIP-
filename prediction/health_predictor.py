import random


class HealthPredictor:

    def __init__(self):
        pass


    def predict(
            self,
            ear,
            blinks,
            yawn_count):

        score = 100

        stress = "Low"
        fatigue = "Healthy"
        sleep = "Good"

        # Eye Closure

        if ear < 0.22:

            score -= 25

        elif ear < 0.25:

            score -= 10

        # Blink Analysis

        if blinks < 8:

            score -= 15

        elif blinks > 25:

            score -= 5

        # Yawning

        if yawn_count:

            score -= 20

        # Fatigue

        if score > 85:

            fatigue = "Healthy"

        elif score > 70:

            fatigue = "Low Fatigue"

        elif score > 55:

            fatigue = "Moderate Fatigue"

        elif score > 40:

            fatigue = "High Fatigue"

        else:

            fatigue = "Critical"

        # Stress

        if score > 80:

            stress = "Low"

        elif score > 60:

            stress = "Moderate"

        else:

            stress = "High"

        # Sleep

        if score > 80:

            sleep = "Excellent"

        elif score > 60:

            sleep = "Average"

        else:

            sleep = "Poor"

        mood = random.choice(

            [
                "Happy",
                "Neutral",
                "Focused"
            ]

        )

        return {

            "score":score,

            "fatigue":fatigue,

            "stress":stress,

            "sleep":sleep,

            "mood":mood

        }