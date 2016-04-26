import os, json
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash, Response
from firebase import firebase
from werkzeug import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
import rstr
from flask.ext.cors import CORS



app = Flask(__name__)
app.config.update(
    MAIL_SERVER = 'smtp.gmail.com',
    MAIL_PORT=465,
    MAIL_USE_SSL=True,
    MAIL_USE_TLS=False,
    MAIL_USERNAME= 'diowebdev@gmail.com',
    MAIL_PASSWORD= 'Google12345678'
    )

app.secret_key = 'F12Zr47j\3yX R~X@H!jmM]Lwf/,?KT'
firebase = firebase.FirebaseApplication('https://karmadb.firebaseIO.com', None)
mail =  Mail(app)


@app.route('/chat/<string:chat_id>')
def chat(chat_id):
    return render_template('chat.html', chat_id=chat_id)


@app.route('/history')
def history():
    return render_template('history.html')

@app.route('/main')
def main():
    return render_template('main.html')

@app.route('/')
def hello():
	return redirect(url_for('login'))
    # return render_template('hello.html')

@app.route('/logout')
def logout():
    session['logged_in'] = False
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template('login.html');

@app.route('/verifyemail', methods=['GET', 'POST'])
def sendVerifyEmail():
    if request.method == 'POST':
        request_body = request.get_json()
        print(request_body)
        user_uid = request_body['uid'] 
        code_gen = rstr.letters(8)
        code = '{}{}'.format(code_gen, user_uid)

        post = {'verificationcode':code, 'verified': False}
        url = 'users/{}'.format(user_uid)
        document = firebase.patch(url, post)
        document = firebase.get(url, None)
        print(document)
        email = document["email"]
        msg = Message(
                  'Hello',
               sender='diowebdev@gmail.com',
               recipients=[email])
        verify_url = "http://localhost:5000/verify/{}".format(code)
        msg.html = "<a href='{}'>Verify your email</a>".format(verify_url)
        mail.send(msg)
        js = json.dumps({'status':'OK'})
        return Response(js, status=200, mimetype='application/json')

@app.route('/verify/<string:code>')
def verifyCode(code):
    verif_code = code[:8]
    user_uid = code[8:]
    url = 'users/{}'.format(user_uid)
    document = firebase.get(url, None)
    email = document["email"]
    firebaseCode = document["verificationcode"]
    if (firebaseCode == code):
        if (document['verified'] == True):
            return redirect(url_for('login'))
        else:
            firebase.patch(url, {'verified':True, 'verificationcode': ''})
    return '{} is verified. Please log in <a href="http://localhost:5000/">here</a>.'.format(email)

@app.route('/checkAuth', methods=['GET', 'POST'])
def check_auth():
    request_body = request.get_json()
    user_name = request_body['inputUsername'] 
    user_password = request_body['inputPassword']   

    if request.method == 'POST':
        # print(user_name)
        # print(user_password)
        document = firebase.get('/users', user_name)
        # print(document)
        # validate the received values  
        if not (user_name and user_password):
            # print("empty fields") 
            js = json.dumps({'status':'ERROR', 'errorMessage':'Enter all fields!'})
            return Response(js, status=500, mimetype='application/json')
        else:
            document = firebase.get('/users', user_name)
            # print(document)
            if not document:
                js = json.dumps({'status':'ERROR', 'errorMessage':"Email ID doesn't exist! Try again!"})
                return Response(js, status=500, mimetype='application/json')
            elif check_password_hash(document["password"], user_password):
                session['logged_in'] = True;
                session['username'] = user_name;
                session.modified = True;
                # print(session_id)
                js = json.dumps({'status':'OK'})
                print('auth', session)
                return Response(js, status=200, mimetype='application/json')
                #return json.dumps({'status':'OK', 'redirect':url_for('main')})
            else:
                js = json.dumps({'status':'ERROR', 'errorMessage':'Error credentials'})
                return Response(js, status=500, mimetype='application/json')

@app.route('/addUser', methods=['GET', 'POST'])
def add_user():
    request_body = request.get_json()
    if (request.method == "POST"):
        user_username = request_body['inputUsername']
        user_name = request_body['inputFullName']
        user_email = request_body['inputEmail']
        user_password = request_body['inputPassword']
    
    document = firebase.get('/users', user_name)
    # print(document)
    if document:
        js = json.dumps({'status':'ERROR', 'errorMessage':"username taken"})
        return Response(js, status=499, mimetype='application/json')

    if not (not document and user_username and user_name and user_email and user_password):
        # check username uniqueness

        js = json.dumps({'status':'ERROR', 'errorMessage':"incomplete credentials for registration"})
        return Response(js, status=500, mimetype='application/json')
    else:
        post = {'username':user_username, 'name': user_name, 'password':generate_password_hash(user_password)
        , 'email':user_email}
        firebase.put('/users', user_username, post)
        session['logged_in'] = True;
        session['username'] = user_username;
        js = json.dumps({'status':'OK', 'errorMessage':'Error credentials'})
        return Response(js, status=200, mimetype='application/json')
    
@app.route('/register')
def register():
    return render_template('register.html');

if __name__ == '__main__':
    # session.modified = True
    # app.secret_key='AAAAAAbbbbccc'
    #os.urandom(12)
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True,host='0.0.0.0', port=port)