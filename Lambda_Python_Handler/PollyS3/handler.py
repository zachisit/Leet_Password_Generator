import json, random, boto3, datetime, string, glob, urllib.request, uuid
from boto3 import Session
from boto3 import resource
from botocore.client import Config

# version 0.0.3

def lambda_handler(event, context):
    # build our data
    payload = json.loads(event['body'])
    print(payload)
    password = payload['password']

    # create API result
    response = APIResult(password)
    
    return {
        'isBase64Encoded': False,
        'statusCode': response.returnStatusCode(),
        #'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials' : True
        },
        'body': json.dumps(response.returnResponse())
        #'body': json.dumps('hi)
    }
    
class APIResult:
    def __init__(self,password):
        self.validatePassword(password)
        
    def validatePassword(self, password):
        if (password):
            #TODO
            r = CreatePollyStringFromPassword(password)
            curatedPassword = r.getFinalPassword()
            d = Pollys3(curatedPassword)
            d.generateMP3()
            url = d.getURL()
            print(url)
            self.response = url
            self.status = 200
        else:
            self.status = 404
            self.response = 'Password passed in is not a password.'
        
    def returnStatusCode(self):
        return self.status
    
    def returnResponse(self):
        return self.response

class Pollys3:
    bucket_name = "cdn.audio.passwordington.com"
    presignedURL = ''
    generatedMP3Object = ''
    generatedFileName = ''
    
    def __init__(self, passwordString):
        self.password = passwordString
        self.s3Resource = resource('s3')
        
    def returnRandomVoiceID(self):
        list = ['Joey','Matthew','Salli','Kimberly','Kendra','Joanna']
        return random.choice(list)
        
    def buildPasswordIntoSpacedString(self):
        return ''
        
    def returnFileName(self):
        id = uuid.uuid1()
        filename = id.hex
        extension = '.mp3'
        fullFilename = filename + extension
        self.generatedFileName = fullFilename
        return fullFilename
        
    def generateMP3(self):
        session = Session(region_name="us-east-1")
        polly = session.client("polly")
        bucket = self.s3Resource.Bucket(self.bucket_name)
        filename = self.returnFileName()
        myText = self.password
    
        response = polly.synthesize_speech(
                        Text=myText,
                        OutputFormat="mp3",
                        VoiceId=self.returnRandomVoiceID())
        stream = response["AudioStream"]
        
        self.generatedMP3Object = bucket.put_object(Key=filename, Body=stream.read())
        
    def getURL(self):
        s3 = boto3.client('s3', config=Config(signature_version='s3v4'))
        url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': self.bucket_name,
                'Key': self.generatedFileName
            },
            ExpiresIn=604800
        )
        return url
        
class CreatePollyStringFromPassword:
    #previousPassword;
    #newPassword;
    finalPassword = ''
    
    def __init__(self,previousPassword):
        self.validatePassword(previousPassword)
        
    def validatePassword(self, previousPassword):
        listPassword = list(previousPassword)
        letterOptions = self.returnSpecialCharList()
        
        for i in range (len(listPassword)):
            if listPassword[i].isalpha():
                print(listPassword[i]+' is alpha')
                if listPassword[i].isupper():
                    listPassword[i] = 'uppercase ' + listPassword[i]
                elif listPassword[i].islower():
                    listPassword[i] = 'lowercase ' + listPassword[i]
            if listPassword[i] in letterOptions:
                    print(listPassword[i]+' is in letterOptions')
                    listPassword[i] = letterOptions.get(listPassword[i])
                
        finalString = ', '.join(map(str, listPassword))
        self.finalPassword = finalString
        
    def returnSpecialCharList(self):
        letterOptions = {
            '*':'asterisk symbol',
            '@':'at symbol',
            '%':'percentage symbol',
            '&':'ampersand symbol',
            '#':'pound symbol',
            '.':'period',
            '!':'exclamation mark symbol'
        }
                
        return letterOptions
        
    def getFinalPassword(self):
        return self.finalPassword
