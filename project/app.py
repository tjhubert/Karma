import os, json
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash, Response
from firebase import firebase
from werkzeug import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'F12Zr47j\3yX R~X@H!jmM]Lwf/,?KT'
firebase = firebase.FirebaseApplication('https://karmadb.firebaseIO.com', None)

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

@app.route('/logout')
def logout():
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template('login.html');
    
@app.route('/register')
def register():
    return render_template('register.html');

if __name__ == '__main__':
    # session.modified = True
    # app.secret_key='AAAAAAbbbbccc'
    #os.urandom(12)
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True,host='0.0.0.0', port=port)