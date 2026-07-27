import cv2
import math

class HealthHUD:

    def draw_corner_box(self, frame, x, y, w, h, color=(0,255,255), thickness=2):

        line = 30

        # Top Left
        cv2.line(frame,(x,y),(x+line,y),color,thickness)
        cv2.line(frame,(x,y),(x,y+line),color,thickness)

        # Top Right
        cv2.line(frame,(x+w,y),(x+w-line,y),color,thickness)
        cv2.line(frame,(x+w,y),(x+w,y+line),color,thickness)

        # Bottom Left
        cv2.line(frame,(x,y+h),(x+line,y+h),color,thickness)
        cv2.line(frame,(x,y+h),(x,y+h-line),color,thickness)

        # Bottom Right
        cv2.line(frame,(x+w,y+h),(x+w-line,y+h),color,thickness)
        cv2.line(frame,(x+w,y+h),(x+w,y+h-line),color,thickness)


    def circular_meter(self, frame, score):

        center = (110,610)

        radius = 70

        cv2.circle(frame,center,radius,(70,70,70),10)

        angle = int((score/100)*360)

        cv2.ellipse(
            frame,
            center,
            (radius,radius),
            -90,
            0,
            angle,
            (0,255,0),
            10
        )

        cv2.putText(
            frame,
            str(score),
            (85,620),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255,255,255),
            2
        )

        cv2.putText(
            frame,
            "HEALTH",
            (60,700),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255,255,0),
            2
        )


    def top_bar(self,frame):

        cv2.rectangle(frame,(0,0),(1280,50),(20,20,20),-1)

        cv2.putText(
            frame,
            "AI HEALTH MONITORING SYSTEM",
            (380,35),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255,255,255),
            2
        )


    def scanning_line(self,frame,position):

        cv2.line(
            frame,
            (0,position),
            (1280,position),
            (255,255,0),
            2
        )