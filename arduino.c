#include <LobotServoController.h>

LobotServoController myse(Serial1);
int r = 1;
String incoming = "";   // for incoming serial string data

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(115200);   // Communicate with PI
  //while(!Serial);
  Serial.setTimeout(300); // Set the timeout to 300 ms.
  
  Serial1.begin(9600);    // Communication with the Robot
  while(!Serial1);
  digitalWrite(13,HIGH);

  // Reset
  myse.moveServo(0,1500,1000);
  delay(2000);
  
  myse.moveServo(1,1500,1000);
  delay(2000);
  
  myse.moveServo(2,1500,1000);
  delay(2000);
  
  myse.moveServo(3,1500,1000);
  delay(2000);
  
  myse.moveServo(4,1500,1000);
  delay(2000);
  
  myse.moveServo(5,1500,1000);
  delay(2000);

//  Continous run #100 action group
//  myse.runActionGroup(100,0);  
//  delay(5000);

//  Stop the action group
//  myse.stopActionGroup(); 
//  delay(2000);

//  Set the action speed of #100 to 200%
//  myse.setActionGroupSpeed(100,200); 
//  delay(2000);

//  Run action group #100 for 5 times
//  myse.runActionGroup(100,5);  
//  delay(5000);

//  myse.stopActionGroup();
//  delay(2000);

//  Move #1 servo to 1500 within 1000ms
//  myse.moveServo(1,1500,1000); 
//  delay(2000);
//  myse.moveServo(2,800,1000);
//  delay(2000);


//  Control 5 servos, transition time is 1000ms，
//  - #0 servo to position of 1300
//  - #2 servo to position of 700，
//  - #4 servo to position of 600，
//  - #6 servo to position of 900，
//  - #8 servo to position of 790
//  myse.moveServos(5,1000,0,1300,2,700,4,600,6,900,8,790);
//  delay(2000);
//

//  Control two servos, transition time is 1000ms
//  LobotServo servos[2];       //servo position array
//  servos[0].ID = 2;           //#2 servo
//  servos[0].Position = 1400;  //position of 1400
//  servos[1].ID = 4;           //#4 servo
//  servos[1].Position = 700;   //position of 700
//  myse.moveServos(servos,2,1000);  
}

String findTheNthWord(String input, int n) {
  String rc = "";
  input.trim();
  if (input.length() <= 0) {
    return rc;
  }

  int i = 0;
  int currPosition = 0;
  while(i++ < n) {
    currPosition = input.indexOf(' ', currPosition);
    if (currPosition != -1) {
      currPosition = currPosition + 1;
      while (input.charAt(currPosition) == ' ' && currPosition < input.length()) {
        currPosition += 1;
      }
    } else {
      break;
    }
  }

  if (currPosition == -1) {
    return rc;
  } else {
    int end = input.indexOf(' ', currPosition);
    if (end == -1) {
      end = input.length(); 
    }
    rc = input.substring(currPosition, end);
  }

  return rc;
}

void loop() {
  // send data only when you receive data:
  if (Serial.available() > 0) {
    // read the incoming:
    incoming = Serial.readString();
    incoming.trim();

    //Serial.println(incoming);
    if (incoming.startsWith("servo ")) {
      // I.E "servo 1 1500 1000" -- Move servo 1's position to 1500 in 1 second
      String servoId = findTheNthWord(incoming, 1);
      servoId.trim();
      int servoIdInt = servoId.toInt();
      
      String servoPosition = findTheNthWord(incoming, 2);
      servoPosition.trim();
      int servoPositionInt = servoPosition.toInt();
      
      String servoSpeed = findTheNthWord(incoming, 3);
      servoSpeed.trim();
      int servoSpeedInt = servoSpeed.toInt();

      if (servoId.length() > 0 && servoPosition.length() > 0 && servoSpeed.length() > 0) {
        Serial.println("move servo: \n" + servoId + " " + servoPosition + " " + servoSpeed);
        Serial.flush();

        if (servoIdInt == 2 || servoIdInt == 3 || servoIdInt == 4) {
          myse.moveServo(servoIdInt + 1, servoPositionInt, 2000);
          delay(3000);
        } else {
          myse.moveServo(servoIdInt + 1, servoPositionInt, 1000);
          delay(2000);
        }
      }
    }
    else if (incoming.startsWith("group ")) {
      String groupAction = findTheNthWord(incoming, 1);
      groupAction.trim();

      if (groupAction.equals("start")) {
        String groupId = findTheNthWord(incoming, 2);
        long groupIdInt = groupId.toInt();
        myse.runActionGroup(groupIdInt, 1);  //run the action group once
        Serial.println("Started the group action of: " + groupId);
        Serial.flush();
        delay(5000);
      } else if (groupAction.equals("stop")) {
        myse.stopActionGroup();              //stop running the action group.
        Serial.println("Stopped the group action.");
        Serial.flush();
        delay(2000);
      } else {
        Serial.println("Invalid group action command of: \n" + incoming);
        Serial.flush();
      }
    }     
    else {
      //junk
      Serial.println("Invalid command of: \n" + incoming);
      Serial.flush();
      incoming = "";
    }
  } 
}
