import cv2

from camera.webcam import Webcam
from camera.face_detector import FaceDetector
from camera.eye_detector import EyeDetector, LEFT_EYE, RIGHT_EYE
from camera.blink_counter import BlinkCounter
from camera.yawn_detector import YawnDetector

from prediction.health_predictor import HealthPredictor
from utils.visualization import HealthHUD


class HealthScanner:

    def __init__(self):

        self.webcam = Webcam()
        self.face_detector = FaceDetector()
        self.eye_detector = EyeDetector()
        self.blink_counter = BlinkCounter()
        self.yawn_detector = YawnDetector()

        # AI Predictor
        self.predictor = HealthPredictor()

        # HUD
        self.hud = HealthHUD()

        # Scanning animation
        self.scan_line = 0

    def run(self):

        while True:

            frame = self.webcam.get_frame()

            if frame is None:
                break

            # ---------------- HUD ---------------- #

            self.hud.top_bar(frame)

            self.hud.scanning_line(
                frame,
                self.scan_line
            )

            self.scan_line += 4

            if self.scan_line > frame.shape[0]:
                self.scan_line = 0

            # ------------ FACE DETECTION ------------ #

            result = self.face_detector.detect(frame)

            if result.multi_face_landmarks:

                for face in result.multi_face_landmarks:

                    h, w, _ = frame.shape

                    landmarks = []

                    for lm in face.landmark:

                        landmarks.append(
                            (
                                int(lm.x * w),
                                int(lm.y * h)
                            )
                        )

                    xs = [p[0] for p in landmarks]
                    ys = [p[1] for p in landmarks]

                    x = min(xs)
                    y = min(ys)

                    box_w = max(xs) - x
                    box_h = max(ys) - y

                    self.hud.draw_corner_box(
                        frame,
                        x,
                        y,
                        box_w,
                        box_h
                    )

                    # ---------- Eye Analysis ---------- #

                    leftEAR = self.eye_detector.eye_ratio(
                        landmarks,
                        LEFT_EYE
                    )

                    rightEAR = self.eye_detector.eye_ratio(
                        landmarks,
                        RIGHT_EYE
                    )

                    ear = (leftEAR + rightEAR) / 2

                    # ---------- Blink Counter ---------- #

                    blinks = self.blink_counter.update(ear)

                    # ---------- Yawn Detection ---------- #

                    yawn = self.yawn_detector.detect(
                        landmarks
                    )

                    # ---------- AI Prediction ---------- #

                    health = self.predictor.predict(
                        ear,
                        blinks,
                        yawn
                    )

                    score = health["score"]
                    fatigue = health["fatigue"]
                    stress = health["stress"]
                    sleep = health["sleep"]
                    mood = health["mood"]

                    # ---------- Draw Landmarks ---------- #

                    for point in landmarks:

                        cv2.circle(
                            frame,
                            point,
                            1,
                            (0, 255, 255),
                            -1
                        )

                    # ---------- Health Meter ---------- #

                    self.hud.circular_meter(
                        frame,
                        score
                    )

                    # ---------- Information Panel ---------- #

                    cv2.rectangle(
                        frame,
                        (20, 70),
                        (380, 430),
                        (35, 35, 35),
                        -1
                    )

                    info = [
                        ("AI ANALYSIS", (255,255,255)),
                        (f"Health Score : {score}", (0,255,0)),
                        (f"Fatigue : {fatigue}", (255,255,0)),
                        (f"Stress : {stress}", (0,255,255)),
                        (f"Sleep : {sleep}", (255,255,255)),
                        (f"Mood : {mood}", (0,255,0)),
                        (f"Blinks : {blinks}", (255,255,255)),
                        (f"EAR : {ear:.2f}", (255,170,0)),
                        (f"Yawn : {yawn}", (0,0,255)),
                    ]

                    y_pos = 105

                    for text, color in info:

                        cv2.putText(
                            frame,
                            text,
                            (40, y_pos),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.65,
                            color,
                            2
                        )

                        y_pos += 35

            else:

                cv2.putText(
                    frame,
                    "NO FACE DETECTED",
                    (430, 350),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 0, 255),
                    3
                )

            cv2.imshow(
                "AI Health Monitoring System",
                frame
            )

            key = cv2.waitKey(1)

            if key == 27:
                break

        self.webcam.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":

    scanner = HealthScanner()
    scanner.run()