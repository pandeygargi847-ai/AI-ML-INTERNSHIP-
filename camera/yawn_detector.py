import numpy as np


MOUTH=[13,14]


class YawnDetector:

    def distance(self,a,b):
        return np.linalg.norm(
            np.array(a)-np.array(b)
        )

    def detect(self,landmarks):

        upper=landmarks[MOUTH[0]]
        lower=landmarks[MOUTH[1]]

        opening=self.distance(
            upper,
            lower
        )

        if opening>18:
            return True

        return False