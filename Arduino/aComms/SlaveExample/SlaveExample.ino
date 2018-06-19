#include "aSlave.h"

aHost test;

void setup() {
  // put your setup code here, to run once:
 test.start();
 test.addFunc('M','E',&runMe);
}
 

void runMe(){
  strcpy(test.returnString,"Hello");
  test.reply();
  }


void loop() {

test.getData();  //must be in the loop and run regularly (or constantly)

}
