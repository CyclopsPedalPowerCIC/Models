/*

Cyclops ESP8266 12E client code. This code will use to initialise the wifi connection between all of the seperate ESP's 
such that they are all connected to the same network. This is achieved by using one fixed Server which can send out the 
relevant settings

*/


#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>

void setup(){}//will be deleted in final version as this is intended to be used as a library only
void loop(){}

ESP8266WiFiMulti initialWiFi;

String cyclopsSSID = "";
String cyclopsPASS = "";


char* initialSSID = "CyclopsWifi";
char* initialPASS = "skullface";


void cyclopsWifiSetup(){

    initialWiFi.addAP(initialSSID, initialPASS);
    while((WiFiMulti.run() != WL_CONNECTED)){delay(200);}//wait until wifi is connected
    
      
    http.begin("http://192.168.0.89/Wifi"); //HTTP

  
  }

