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

#include <stdlib.h>
#include <avr/pgmspace.h>  // Library for putting data into program memory
#include <EEPROM.h>        // For writing values to the EEPROM
#include <avr/eeprom.h>    // For writing values to EEPROM


char inByte;         // incoming serial char
//String str_buffer = "";  // This is the holder for the string which we will display
#define MAX_STRING 13      // Sets the maximum length of string
char stringBuffer[MAX_STRING];  // A buffer to hold the string when pulled from program memory

char deviceID[3]; // A buffer to hold the device ID

//int hiByte;      // These are used to store longer variables into EERPRPROM
//int loByte;


void setup() {
  Serial.begin(115200);

  // Read in the values from EEPROM
  // Read the device ID
  deviceID[0] = char(EEPROM.read(0));
  deviceID[1] = char(EEPROM.read(1)); 
  Serial.print("Device ID is: ");
  Serial.print(deviceID[0]);
  Serial.println(deviceID[1]);


}

void loop() {
  // put your main code here, to run repeatedly:
  long start = micros();
  getData();
  Serial.println(micros()-start);
  delay(150); //approximate delay of capacitance read (or 10 each)
}


void getData()
{
  // **********GET DATA*******************************************
  // We want to find the bit of interesting data in the serial data stream
  // As mentioned above, we are using LLAP for the data.
  // All the data arrives as serial commands via the serial interface.
  // All data is in format aXXMIDDDDDDD where XX is the device ID and MI is the message ID
  while (Serial.available() > 0) 
  {
    inByte = Serial.read(); // Read whatever is happening on the serial port
  
    if(inByte=='a')    // If we see an 'a' then read in the next 11 chars into a buffer.
    {   
      stringBuffer[0]=inByte;
      for(int i = 0; i<11;i++)  // Read in the next 11 chars - this is the data
      {
        inByte = Serial.read(); 
        stringBuffer[i+1]=inByte;
      }
      //Serial.println(str_buffer);  // TEST - print the str_buffer data (if it has arrived)
      sortData();
    }
  }
}

// **********************SORT DATA SUBROUTINE*****************************************
// This sub-routine takes the read-in data string (12 char, starting with a) and does what is required with it
// The str-buffer is global so we do not need to send it to the routine

void sortData()
{ 
  // We first want to check if the device ID matches.
  // If it does not then we disregard the command (as it was not meant for this device      
  if((stringBuffer[1] == deviceID[0])&&(stringBuffer[2] == deviceID[1]))
  {
    // If yes then we can do further checks on ths data
    // This is where we do all of the checks on the incomming serial command:
    
    //Serial.println("OK");  // TEST - got into this routine
    // Change device ID:
    // Device ID
    // “aXXCHIDXXE--“
    // Where the last two values (XX) are the new device ID (from AA to ZZ).
    if((stringBuffer[3] == 'C')&&(stringBuffer[4] == 'H')&&(stringBuffer[5] == 'I')&&(stringBuffer[6] == 'D'))
    {
      // First check if the NEW device ID is within the allowable range (AA-ZZ)
      // to do this we can convert to an int and check if it is within the OK levels
      // A -> int is 65, Z -. int is 90
      // So our new device ID as an int must be between 65 and 90 for it to be valid
      if(65<=int(stringBuffer[7])&&int(stringBuffer[7])<=90&&65<=int(stringBuffer[8])&&int(stringBuffer[8])<=90)   
      { // If is all OK then write the data
        // Change device ID
        Serial.print("Changing Device ID from ");
        Serial.print(deviceID);
        Serial.print(" to ");
        Serial.print(stringBuffer[7]); 
        Serial.println(stringBuffer[8]);  // This will change the device ID
        deviceID[0] = stringBuffer[7];
        deviceID[1] = stringBuffer[8];
        // Also want to store this into EEPROM
        EEPROM.write(0, deviceID[0]);    // Do this seperately
        EEPROM.write(1, deviceID[1]);
      }
      else
      {
        //Serial.println("Invalid device ID"); 
     }      
    } 
    
     // Ask voltage set-point
    //  To ask the set-point we can send:
    //  “aXXV?-----“ 
    else if((stringBuffer[5] == 'H')&&(stringBuffer[6] == 'e'))
    //else
    {
      // Show voltage
      Serial.print("a");
      Serial.print(stringBuffer[3]); //the Message ID
      Serial.print(stringBuffer[4]);
      Serial.print(millis());
      Serial.print("----------");
      Serial.println("");
    } 

     // Ask for currents
    //  To ask the set-point we can send:
    //  “aXXI?-----“ 
   
    
  }
  
}
