import time
from itertools import chain
import email
import imaplib
import base64
import os
import re

imap_ssl_host = 'imap.gmail.com'
imap_ssl_port = 993
username = email_username
password = email_password
mail = None

criteria = {}
uid_max = 0

def search_string(uid_max, criteria):
    c = list(map(lambda t: (t[0], '"'+str(t[1])+'"'), criteria.items())) + [('UID', '%d:*' % (uid_max+1))]
    return '(%s)' % ' '.join(chain(*c))

try:
    while True:
        mail = imaplib.IMAP4_SSL(imap_ssl_host)
        mail.login(username, password)
        mail.select('inbox')
        result, data = mail.uid('search', None, search_string(uid_max, criteria))
        uids = [int(s) for s in data[0].split()]

        for uid in uids:
            # Have to check again because Gmail sometimes does not obey UID criterion.
            if uid > uid_max:
                result, data = mail.uid('fetch', str(uid), '(RFC822)')
                for response_part in data:
                    if isinstance(response_part, tuple):
                        #message_from_string can also be use here
                        msg = email.message_from_string(response_part[1].decode())
                        
                        if msg['subject'] == "New Registration to DEFCON" and msg['from'] == "etasboschdefcon@gmail.com":
                            body = msg.get_payload(decode=True).decode("utf-8")
                            
                            sshkey = body.split(',')[1]
                            print (sshkey)
                            comment = "#" + body.split(',')[0]
                            print (comment)

                            file_path = '/home/canopener/.ssh/authorized_keys'
                            try: 
                                with open(file_path, 'a') as file: 
                                    file.write(comment + '\n')
                                    file.write(sshkey + '\n')                                     
                                print(f"Text appended to {file_path} successfully.") 
                            except Exception as e: 
                                print(f"Error: {e}") 


                        #print(email.message_from_bytes(response_part[1])) #processing the email here for whatever
                uid_max = uid

except KeyboardInterrupt:
    mail.logout()
    time.sleep(1)