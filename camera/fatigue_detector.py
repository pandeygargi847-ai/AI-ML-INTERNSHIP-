class FatigueDetector:

    def predict(self,ear,blinks,yawn):

        score=100

        if ear<0.22:
            score-=25

        if blinks<8:
            score-=15

        if yawn:
            score-=25

        if score>=85:
            status="Healthy"

        elif score>=70:
            status="Normal"

        elif score>=50:
            status="Mild Fatigue"

        elif score>=30:
            status="Fatigued"

        else:
            status="Highly Fatigued"

        return score,status