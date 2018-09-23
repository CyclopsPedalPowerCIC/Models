/*
 * --------------------------------------------------------------------------------------------------------------------
 * Example sketch/program showing how to read new NUID from a PICC to serial.
 * --------------------------------------------------------------------------------------------------------------------
 * This is a MFRC522 library example; for further details and other examples see: https://github.com/miguelbalboa/rfid
 * 
 * Example sketch/program showing how to the read data from a PICC (that is: a RFID Tag or Card) using a MFRC522 based RFID
 * Reader on the Arduino SPI interface.
 * 
 * When the Arduino and the MFRC522 module are connected (see the pin layout below), load this sketch into Arduino IDE
 * then verify/compile and upload it. To see the output: use Tools, Serial Monitor of the IDE (hit Ctrl+Shft+M). When
 * you present a PICC (that is: a RFID Tag or Card) at reading distance of the MFRC522 Reader/PCD, the serial output
 * will show the type, and the NUID if a new card has been detected. Note: you may see "Timeout in communication" messages
 * when removing the PICC from reading distance too early.
 * 
 * @license Released into the public domain.
 * 
 * Typical pin layout used:
 * -----------------------------------------------------------------------------------------
 *             MFRC522      Arduino       Arduino   Arduino    Arduino          Arduino
 *             Reader/PCD   Uno/101       Mega      Nano v3    Leonardo/Micro   Pro Micro     ESP8266
 * Signal      Pin          Pin           Pin       Pin        Pin              Pin
 * -----------------------------------------------------------------------------------------
 * RST/Reset   RST          9             5         D9         RESET/ICSP-5     RST           D2
 * SPI SS      SDA(SS)      10            53        D10        10               10            D1 purple
 * SPI MOSI    MOSI         11 / ICSP-4   51        D11        ICSP-4           16            D7
 * SPI MISO    MISO         12 / ICSP-1   50        D12        ICSP-1           14            D6
 * SPI SCK     SCK          13 / ICSP-3   52        D13        ICSP-3           15            D5
 */

#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

//#define SS_PIN D1
//#define SS_PIN_2 D3
#define RST_PIN UINT8_MAX //D2
#define NREADERS 5
#if 0
//pins
#define DATA595 D2
#define CLK595 D3
#define LATCH595 D1
#define DEMUX_INPUT D0 // pin connected to the transparent input of the '259s
#endif
#define RST_PIN D2

struct reader {
  MFRC522 rfid;
  byte serial[4];
} readers[NREADERS];

uint8_t pins[] = { D8, D4, D3, D1, D0 };
MFRC522::MIFARE_Key key; 

unsigned long lastelapsed;

// Init array that will store new NUID 
//byte nuidPICC[4];

void init_readers () {
  int i;
  SPI.begin(); // Init SPI bus
  for (i=0; i<NREADERS; i++) {
    //set_latch_address(i);
    Serial.print(i);
    //readers[i].rfid = MFRC522(DEMUX_INPUT, UINT8_MAX);
    readers[i].rfid = MFRC522(pins[i], UINT8_MAX);
    readers[i].rfid.PCD_Init(); // Init MFRC522 
    Serial.println(readers[i].rfid.PCD_PerformSelfTest() ? "OK" : "fail");
    readers[i].rfid.PCD_Init(); // Init MFRC522 
    Serial.print(":");
    memset(readers[i].serial, 0, sizeof readers[i].serial);
  }
}

void poll_readers () {
  for (int i=0; i<NREADERS; i++) {
    //set_latch_address(i);
    checkcard(readers[i]);
  }
}

ESP8266WebServer server(80);

void init_server() {
  const char* ssid = "LeedsHackspace";
  const char* password = "blinkyLED";

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esprfid")) {
    Serial.println("MDNS responder started");
  }

  server.on("/", handleRoot);
  
  //server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
}

void handleRoot() {
  //digitalWrite(led, 1);
  String res;
  char buf[30];
  //Serial.println("/");
  for (int i=0; i<NREADERS; i++) {
    snprintf(buf, sizeof buf, "%d: %02x%02x%02x%02x\n", i, readers[i].serial[0], readers[i].serial[1], readers[i].serial[2], readers[i].serial[3]);
     res += buf;
   }
  snprintf(buf, sizeof buf, "%d elapsed\n", lastelapsed);
  res += buf;
  server.send(200, "text/plain", res);
  //digitalWrite(led, 0);
}

void setup() { 
  Serial.begin(115200);
  Serial.println("A");
#if 0
  pinMode(DATA595, OUTPUT);
  pinMode(CLK595, OUTPUT);
  pinMode(LATCH595, OUTPUT);
  pinMode(LATCH595, OUTPUT);
  pinMode(LED_BUILTIN, OUTPUT);

  pinMode(DEMUX_INPUT, OUTPUT);

  // set all the latch outputs high
  digitalWrite(DEMUX_INPUT, HIGH);
  for (byte i=0; i<32; i++) {
    set_latch_address (i);
    delayMicroseconds(100);
  }
#endif
#if 1
  // pull shared reset pin low
  pinMode(RST_PIN, OUTPUT);
  digitalWrite(RST_PIN, LOW);
  delay(50);
  digitalWrite(RST_PIN, HIGH);  
  delay(10);
#endif
  SPI.begin(); // Init SPI bus
  init_server();
  init_readers ();
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
}
#if 0
void write595(const uint8_t *arr, uint8_t len) {
  while (len--)
    shiftOut(DATA595, CLK595, MSBFIRST, arr[len]);
  digitalWrite(LATCH595, HIGH); 
  digitalWrite(LATCH595, LOW); 
  digitalWrite(DEMUX_INPUT, HIGH);
}

static inline void set_latch(uint8_t *arr, uint8_t bitno, bool val) {
  uint8_t mask = 1<<(bitno&7);
  arr[bitno>>3] &= ~mask;
  arr[bitno>>3] |= val?mask:0;
}

// pinout on 595 outputs:
// 0-2 A0,A1,A2
// 3,4 LE0 LE1
#define LE0 3
#define LE1 4

uint8_t arr[6] = { 0 };

static void set_latch_address(uint8_t n) {
  uint8_t chip = n & 8;
  uint8_t a012 = n & 7;
  arr[0] = n&7;  // FIXME
  set_latch(arr, LE0, chip?HIGH:LOW);
  set_latch(arr, LE1, chip?LOW:HIGH);
  write595(arr, sizeof arr);
  delay(1);
}
#endif
bool cardpresent(MFRC522 r) {
        byte bufferATQA[2];
        byte bufferSize = sizeof(bufferATQA);

        // Reset baud rates
        r.PCD_WriteRegister(MFRC522::TxModeReg, 0x00);
        r.PCD_WriteRegister(MFRC522::RxModeReg, 0x00);
        // Reset ModWidthReg
        r.PCD_WriteRegister(MFRC522::ModWidthReg, 0x26);

        MFRC522::StatusCode result = r.PICC_WakeupA(bufferATQA, &bufferSize);
        return (result == MFRC522::STATUS_OK || result == MFRC522::STATUS_COLLISION);
}

void checkcard(struct reader &r) {
  MFRC522 rfid = r.rfid;
  // Look for new cards
  memset(r.serial, 0, sizeof r.serial);

//  if ( ! rfid.PICC_IsNewCardPresent())
//    return;
  if (!cardpresent(rfid));// return;

  // Verify if the NUID has been readed
  if ( ! rfid.PICC_ReadCardSerial())
    return;

  //Serial.print(r.name);
  Serial.print(F("PICC type: "));
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  Serial.println(rfid.PICC_GetTypeName(piccType));

  // Check is the PICC of Classic MIFARE type
  if (piccType != MFRC522::PICC_TYPE_MIFARE_MINI &&  
    piccType != MFRC522::PICC_TYPE_MIFARE_1K &&
    piccType != MFRC522::PICC_TYPE_MIFARE_4K) {
    //Serial.println(F("Your tag is not of type MIFARE Classic."));
    //return;
  }
  memcpy(r.serial, rfid.uid.uidByte, sizeof r.serial);

  // Halt PICC
  rfid.PICC_HaltA();

  // Stop encryption on PCD
  rfid.PCD_StopCrypto1();
  
}

void loop() {
  unsigned long t1, t2;
  t1 = millis();
  poll_readers();
  server.handleClient();
  t2 = millis();
  Serial.print("elapsed ");
  lastelapsed = t2-t1;
  Serial.println(t2-t1);
}

/**
 * Helper routine to dump a byte array as hex values to Serial. 
 */
void printHex(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(buffer[i] < 0x10 ? " 0" : " ");
    Serial.print(buffer[i], HEX);
  }
}
