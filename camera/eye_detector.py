import numpy as np


LEFT_EYE = [33,160,158,133,153,144]
RIGHT_EYE = [362,385,387,263,373,380]


class EyeDetector:

    def distance(self,p1,p2):

        return np.linalg.norm(
            np.array(p1)-np.array(p2)
        )

    def eye_ratio(self,landmarks,indexes):

        p1=landmarks[indexes[0]]
        p2=landmarks[indexes[1]]
        p3=landmarks[indexes[2]]
        p4=landmarks[indexes[3]]
        p5=landmarks[indexes[4]]
        p6=landmarks[indexes[5]]

        vertical1=self.distance(p2,p5)
        vertical2=self.distance(p3,p6)

        horizontal=self.distance(p1,p4)

        ear=(vertical1+vertical2)/(2.0*horizontal)

        return ear