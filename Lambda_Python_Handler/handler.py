import json, random, boto3, datetime, string, glob, urllib.request

# version 0.0.11

def lambda_handler(event, context):

    # build our data
    payload = json.loads(event['body'])
    type = payload['passType']

    # create API result
    response = APIResult(type)

    # record entry in DynamoDB
    #@TODO: record failure as well
    #w = WriteToDynamo(IP, context.aws_request_id, type)

    return {
        'isBase64Encoded': False,
        'statusCode': response.returnStatusCode(),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials' : True
        },
        'body': json.dumps(response.returnResponse())
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
        return self.dynamodb.put_item(TableName=self.returnTableName(), Item={'id':{'N':self.generatePrimaryID()},'requestID':{'S':self.requestID},'type':{'S':self.type},'timestamp':{'S':self.generateTimeStamp()},'IP':{'S':self.returnIP()}})

    def returnIP(self):
        return self.IP

    def writeToDynamo(self):
        return 'success' if self.processDynamoWrite() else 'failure'

""" Wrapper method to retrieve password and
    format the response """
class APIResult:
    def __init__(self, type):
        self.validateType(type)

    def validateType(self, type):
        if (type == 'complex') or (type == 'leet'):
            self.pw = GeneratePassword(type)
            self.createPassword()
            self.status = 200
        else:
            self.status = 404
            self.response = 'Invalid type passed into API'

    def createPassword(self):
        self.finalPassword = self.pw.returnCreatedPassword()
        self.response = self.finalPassword

    def returnCreatedPassword(self):
        return str(self.finalPassword)

    def returnStatusCode(self):
        return self.status

    def returnResponse(self):
        return self.response

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

    def generateComplexPassword(self, stringLength=15):
        lettersAndDigits = string.ascii_letters + string.digits
        self.createdPassword = ''.join(random.choice(lettersAndDigits)
for i in range(stringLength))

    def readLeetDictionary(self):
        jsonFile = 'https://s3.amazonaws.com/www.passwordington.com/leetDictionary.json'
        with urllib.request.urlopen(jsonFile) as url:
            self.data = json.loads(url.read().decode())

    def generateLeetPassword(self):
        self.readLeetDictionary()
        self.createdPassword =  str(self.generateGoodBlob() + self.generateSpecialCharBlob() + self.generateBadBlob())

    def generateBadBlob(self):
        return random.choice(self.data['badWords'])

    def generateGoodBlob(self):
        return random.choice(self.data['goodWords'])

    def generateSpecialCharBlob(self):
        return random.choice(self.data['specialCharacters'])