/* 
This server purely redirects connecting ESP's to the correct local wifi network so that all esp's will be on the same network which is 
accessable to everyone, if necessary.



*/





#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

const char* ssid = "CyclopsWifi";
const char* password = "skullface";

String cyclopsssid="VM6035777";//hopefully doesn't need a length specifying?
String cyclopspass="7twtrxBPdndn";//then***need to get standard wifi password from eeprom
int starttime=millis();
int connections=0;
int failures=0;

const int listlength=10;

String devices[listlength];
int deviceIPs[listlength];
int attempts[listlength]={0};

IPAddress local_IP(192,168,4,1);
IPAddress gateway(192,168,4,0);
IPAddress subnet(255,255,255,0);

String welcome = "Welcome to the Cyclops ESP8266 Server";

String Status(){
  String message= "IP= ";
  message += WiFi.softAPIP().toString();
  message += "\n";
  message += String(connections);
  message += " connections in the last ";
  message += (millis()-starttime)/1000;
  message += " seconds\n";
  message += String(failures);
  message += " failures to connect reported";
  
  return message;
  }

ESP8266WebServer server(80);

const int led = 13;

void handleWifi() {
  for (uint8_t i=0; i<server.args(); i++){
      if (server.argName(i)=="name"){
         for (int j=0; j<listlength;j++){
           if (server.arg(i)==devices[j]){attempts[j]++;
           server.send(200, "text/plain", "Repeat Device\n ssid: " + cyclopsssid + " \n pass: " + cyclopspass + "\nIP:   " + gateway.toString());
           connections++;
           return;
           }
           else if (devices[j]=""){devices[j]=server.arg(i);attempts[j]++;
           server.send(200, "text/plain", "New Device");
           connections++;
           return;
           
           }
  }}
  
  }
  
  server.send(200, "text/plain", "Wifi info...");
  return;
}

void handleNotFound(){
  digitalWrite(led, 1);
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET)?"GET":"POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i=0; i<server.args(); i++){
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
  digitalWrite(led, 0);
}

void setup(void){
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(115200); 
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(local_IP, gateway, subnet);
  WiFi.softAP(ssid, password);
  Serial.println("");

  // Wait for connection
//  while (WiFi.status() != WL_CONNECTED) {
//    delay(500);
//    Serial.print(".");
//  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esp8266")) {
    Serial.println("MDNS responder started");
  }

  server.on("/wifi", handleWifi);

  server.on("/", [](){
    server.send(200, "text/plain", welcome);
  });

  server.on("/status", [](){
    server.send(200, "text/plain", Status());
  });

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void){
  server.handleClient();
}
