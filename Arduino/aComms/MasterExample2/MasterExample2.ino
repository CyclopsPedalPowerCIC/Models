#include "aMaster.h"

aComms test;
aDevice test2;

void setup() {
Serial.begin(115200);  // a requirement since all uses serial
Serial.println("Start!");

test2=test.newDevice('D','T');  //can also be created seperately as above
}
 

void runMe(){
  Serial.print("ME!!!");
  //test.reply();
  }


void loop() {
test.check();//should be run repeatedly in a loop
delay(100);
Serial.println(test2.state);
test.sendRequest(&test2,'s','d'); //requests data "sd"
test.sendRequest(&test2,'s','d',&runMe);  //requests data sd and runs runMe when it is recieved
delay(100);
test.check();
delay(1000);


}
