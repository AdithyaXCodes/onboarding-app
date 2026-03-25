from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# Database config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///employees.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ---------- Model ----------
class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    department = db.Column(db.String(50))
    role = db.Column(db.String(50))
    work_mode = db.Column(db.String(50))
    joining_date = db.Column(db.String(20))
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    zip = db.Column(db.String(10))
    photo = db.Column(db.Text)

# Create DB
with app.app_context():
    db.create_all()

# ---------- Routes ----------

@app.route('/api/users', methods=['GET'])
def get_users():
    users = Employee.query.all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "department": u.department,
            "role": u.role,
            "work_mode": u.work_mode,
            "joining_date": u.joining_date,
            "city": u.city,
            "state": u.state,
            "zip": u.zip
            ,"photo": u.photo
        })
    return jsonify({"success": True, "data": result})


@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()

    new_user = Employee(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
        department=data.get("department"),
        role=data.get("role"),
        work_mode=data.get("work_mode"),
        joining_date=data.get("joining_date"),
        city=data.get("city"),
        state=data.get("state"),
        zip=data.get("zip"),
        photo=data.get("photo")
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "data": {"id": new_user.id}}), 201


@app.route('/api/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = Employee.query.get(id)
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": True, "message": "Deleted"})


@app.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    user = Employee.query.get(id)
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    data = request.get_json()

    user.name = data.get("name")
    user.email = data.get("email")
    user.phone = data.get("phone")
    user.department = data.get("department")
    user.role = data.get("role")
    user.work_mode = data.get("work_mode")
    user.joining_date = data.get("joining_date")
    user.city = data.get("city")
    user.state = data.get("state")
    user.zip = data.get("zip")
    user.photo = data.get("photo")

    db.session.commit()

    return jsonify({"success": True, "data": {"id": user.id}})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✅ Database created or already exists")

    app.run(debug=True, port=5003)