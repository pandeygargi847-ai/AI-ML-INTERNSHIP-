import cv2


class Webcam:

    def __init__(self):
        self.camera = cv2.VideoCapture(0)

        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    def get_frame(self):

        success, frame = self.camera.read()

        if not success:
            return None

        frame = cv2.flip(frame, 1)

        return frame

    def release(self):
        self.camera.release()