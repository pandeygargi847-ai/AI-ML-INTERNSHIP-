class BlinkCounter:

    def __init__(self):

        self.blinks = 0

        self.closed = False

    def update(self, ear):

        THRESHOLD = 0.23

        if ear < THRESHOLD:

            if not self.closed:
                self.closed = True

        else:

            if self.closed:
                self.blinks += 1
                self.closed = False

        return self.blinks