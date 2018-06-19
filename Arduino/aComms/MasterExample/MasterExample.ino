#include "aMaster.h"

aComms test(9);
aDevice test2;

void setup() {
Serial.begin(115200);
Serial.println("Start!");

 test2=test.newDevice('D','T');
}
 

void runMe(){

  //test.reply();
  }


void loop() {
test.check();
delay(100);
test.sendRequest(test2,'s','d');
delay(100);
test.check();
delay(1000);
}
