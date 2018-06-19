/*
 * 
 * Serial communication between one master device and multiple slave devices. 
 * Master requests information and the slaves respond in the format aXXXXXXXXXXX
 * Modified from code provided by Matt Little

 The unit will then send back the data in the following format:
  COMMANDS:
  Where XX is the device ID
  aXXCHIDYY---
  This will change the device ID from XX to YY

  aXXMID?-----
  Where XX is the slave device ID and MI is the message identifier. This will return the voltages as:
  aMIDDDDDDDDD
  
  multiple types of data can be requested by specifying A? B? C? D? etc in the message




*/


/************ External Libraries*****************************/

//#include <stdlib.h>
//#include <avr/pgmspace.h>  // Library for putting data into program memory
//#include <ctype.h>

char inByte;         // incoming serial char
#define MAX_STRING 13      // Sets the maximum length of string, 12 chars plus termination char (I think)
char stringBuffer[MAX_STRING];  // A buffer to hold the string when pulled from program memory

#define MAX_MESSAGES 10
char MIList[MAX_MESSAGES][3]; //a list of message id's that have ben sent out
long time1;
long time2;
int i;

//to store data from other ardinos
bool capSensors[16];

void setup() {
  Serial.begin(115200);
  for (i=0; i<MAX_MESSAGES; i++){
    MIList[i][0]=" ";  //set the initial messages list equal to something that wont be ever used
    MIList[i][1]=" ";
    }
}

void loop() {
  // put your main code here, to run repeatedly:
  time1=micros();
  requestData("AA","M1","D?~~~~~",0);
  
  while (getData()) {}
  
  
  delay(5);
  
}



//function to send out data in a uniform way and record where to save the result
void requestData(char deviceI[2],char messageI[2],char message[7],int dataChannel){
  
  Serial.print("a");
  Serial.print(deviceI);
  Serial.print(messageI);
  Serial.print(message);

  MIList[dataChannel][0]=messageI[0];
  MIList[dataChannel][1]=messageI[1];

  
  }

int getData()
{
  // **********GET DATA*******************************************
  // We want to find the bit of interesting data in the serial data stream
  // As mentioned above, we are using LLAP for the data.
  // All the data arrives as serial commands via the serial interface.
  // All data is in format aXXMIDDDDDDD where XX is the device ID and MI is the message ID
  while (Serial.available() > 11) 
  {
    inByte = Serial.read(); // Read whatever is happening on the serial port
  
    if(inByte=='a')    // If we see an 'a' then read in the next 11 chars into a buffer.
    {   
      stringBuffer[0]=inByte;
      for(i = 0; i<11;i++)  // Read in the next 11 chars - this is the data
      {
        inByte = Serial.read(); 
        stringBuffer[i+1]=inByte;
        Serial.print(inByte);
      }
      return sortData();
      
    }
  }
  return 1;
}

// **********************SORT DATA SUBROUTINE*****************************************
// This sub-routine takes the read-in data string (12 char, starting with a) and does what is required with it
// The str-buffer is global so we do not need to send it to the routine

int sortData()
{ 
  // We first want to check if the device ID matches.
  // If it does not then we disregard the command (as it was not meant for this device      
  //Serial.println(stringBuffer);
  for (i=0;i<MAX_MESSAGES;i++){
  if((stringBuffer[1] == MIList[i][0]) && (stringBuffer[2] == MIList[i][1]))
  {
    // If yes then we can do further checks on ths data
    // This is where we do all of the checks on the incomming serial command:
    
    //Serial.println("OK");  // TEST - got into this routine
    
     // Ask voltage set-point
    //  To ask the set-point we can send:
    //  “aXXV?-----“ 
    if(i==0) //first message recieved from capacitance sensors
    {
      // Show voltage
      int j;
      while (isdigit(stringBuffer[j+3])){j++;}
      int k;
      int compact=0;
      for (k=0;k<(j);k++){
        compact+=(stringBuffer[k+3]-'0')*pow(10,k);
        }
        Serial.print("\nReceived: ");
        Serial.println(compact);
      j=2;
      for (k=0;k<16;k++){
        capSensors[k]=(compact%j)*2/j;  //method to uncompact the data, back to binary
        j=j*2;
        Serial.print(capSensors[k]);
        }
    } 

     // Ask for currents
    //  To ask the set-point we can send:
    //  “aXXI?-----“ 
   
    return 0;
  }
  }
  return 1;
}
