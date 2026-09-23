import motor, time
from hub import port

def test():
    # Turn (+ = right) (4200 = full) (full = 6sek)
    motor.run_for_degrees(port.D, 2100, 720)
    time.sleep(6)

    # Main hinge (+ = up) (full = 4sek)
    motor.run_for_degrees(port.B, 360, 90)
    motor.run_for_degrees(port.F, 360, -90)
    time.sleep(4)

    # Upper Hinge (+ = up)
    motor.run_for_degrees(port.A, -540, 90)

    time.sleep(10)

    motor.run_for_degrees(port.A, 540, 90)
    time.sleep(1)
    motor.run_for_degrees(port.B, -360, 90)
    motor.run_for_degrees(port.F, -360, -90)
    time.sleep(4)
    motor.run_for_degrees(port.D, -2100, 720)

test()
