import json, random, boto3, datetime, string, glob, urllib.request

# version 0.0.8

#@TODO: if passed in 'type' not per our type, then return error message 
and set statusCode

def lambda_handler(event, context):
    # build our data
    payload = json.loads(event['body'])
    type = payload['passType']
    IP = payload['IP']
    
    # create API result
    g = APIResult(type)
    g.createPassword()
    g.returnResponse()
    
    # record entry in DynamoDB
    w = WriteToDynamo(IP, context.aws_request_id, type)

    return {
        'isBase64Encoded': False,
        'statusCode': g.returnStatusCode(),
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(g.returnCreatedPassword())
    }
    
""" Wrapper method to connect to and writeStatus
    specific data of via DynamoDB instance """
class WriteToDynamo():
    def __init__(self, IP, requestID, type):
        self.setTableName('ReturnedLeetPasswords')
        self.type = type
        self.dynamodb = self.initDynamo()
        self.IP = IP
        self.requestID = requestID
        
    def returnTableName(self):
        return self.TableName
        
    def initDynamo(self):
        return boto3.client('dynamodb')
        
    def setTableName(self, name):
        self.TableName = name
        
    def generatePrimaryID(self):
        return str(random.randrange(10**11, 10**12))
        
    def generateTimeStamp(self):
        return str(datetime.datetime.now())
        
    def processDynamoWrite(self):
        return self.dynamodb.put_item(TableName=self.returnTableName(), 
Item={'id':{'N':self.generatePrimaryID()},'requestID':{'S':self.requestID},'type':{'S':self.type},'timestamp':{'S':self.generateTimeStamp()},'IP':{'S':self.returnIP()}})
        
    def returnIP(self):
        return self.IP
        
    def writeToDynamo(self):
        return 'success' if self.processDynamoWrite() else 'failure'
        
""" Wrapper method to retrieve password and
    format the response """
class APIResult:
    def __init__(self, type):
        self.pw = GeneratePassword(type)
        
    def createPassword(self):
        self.finalPassword = self.pw.returnCreatedPassword()
        
    def returnCreatedPassword(self):
        return str(self.finalPassword)
        
    def returnStatusCode(self):
        return self.status
        
    def returnResponse(self):
        if self.finalPassword:
            self.status = 200
            self.response = self.finalPassword
        else:
            self.status = 500
            self.response = 'Error occured creating the password. Yell 
at your computer screen now to resolve.'

""" Generates a string based on 
    the type passed in """
class GeneratePassword:
    def __init__(self, type):
        self.type = type
        self.generatePassword()
        
    def returnCreatedPassword(self):
        return self.createdPassword
        
    def generatePassword(self):
        if self.type == 'complex':
            self.generateComplexPassword()
        elif self.type == 'leet':
            self.generateLeetPassword()
        
    def generateComplexPassword(self, stringLength=25):
        lettersAndDigits = string.ascii_letters + string.digits
        self.createdPassword = ''.join(random.choice(lettersAndDigits) 
for i in range(stringLength))
        
    def readLeetDictionary(self):
        jsonFile = 
'https://s3.amazonaws.com/passwurd-hosted-site/leetDictionary.json'
        with urllib.request.urlopen(jsonFile) as url:
            self.data = json.loads(url.read().decode())
            
    def generateLeetPassword(self):
        self.readLeetDictionary()
        self.createdPassword =  str(self.generateFirstBlob() + 
self.generateThirdBlob() + self.generateSecondBlob())
        
    def generateFirstBlob(self):
        return random.choice(self.data['badWords'])
        
    def generateSecondBlob(self):
        return random.choice(self.data['goodWords'])
        
    def generateThirdBlob(self):
        return random.choice(self.data['specialCharacters'])
