import os, json
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash, Response
from firebase import firebase
from werkzeug import generate_password_hash, check_password_hash

app = Flask(__name__)

firebase = firebase.FirebaseApplication('https://karmadb.firebaseIO.com', None)


@app.route('/main')
def main():
    return render_template('main.html')

 #    if 'logged_in' in session:	
	# 	print("in if")	
	# 	if session['logged_in']:
	# 		print("render template main")
	# 		return render_template('main.html')
 #        else:
	# 		return redirect(url_for('login'))
            
	# return redirect(url_for('login'))

@app.route('/')
def hello():
	session['logged_in'] = False
	return render_template('hello.html')

@app.route('/logout')
def logout():
    session['logged_in'] = False
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/login')
def login():
    if('logged_in' in session):
        if(session['logged_in'] == False):
            return render_template('login.html');
        else:
            return redirect(url_for('main'));
    return render_template('login.html');


@app.route('/checkAuth', methods=['GET', 'POST'])
def check_auth():
    request_body = request.get_json()
    user_name = request_body['inputUsername'] 
    user_password = request_body['inputPassword']   

    if request.method == 'POST':
        print(user_name)
        print(user_password)
        document = firebase.get('/users', user_name)
        print(document)
        # validate the received values  
        if not (user_name and user_password):
            print("empty fields") 
            js = json.dumps({'status':'ERROR', 'errorMessage':'Enter all fields!'})
            return Response(js, status=500, mimetype='application/json')
        else:
            document = firebase.get('/users', user_name)
            print(document)
            if not document:
                js = json.dumps({'status':'ERROR', 'errorMessage':"Email ID doesn't exist! Try again!"})
                return Response(js, status=500, mimetype='application/json')
            elif check_password_hash(document["password"], user_password):
                session['logged_in'] = True;
                session['username'] = user_name;
                # session['cust_id'] = '56c66be6a73e492741507c4b'
                print('logged_in' in session)
                # return redirect(url_for('main'))
                js = json.dumps({'status':'OK'})
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
 
    if not (user_username and user_name and user_email and user_password):
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
	app.secret_key=os.urandom(12)
	app.run(debug=True)