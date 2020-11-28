try:
    from api import app
    import unittest
    import os
    import wave

except Exception as e:
    print("Some Modules are Missing {}".format(e))


class FlaskTest(unittest.TestCase):

    # check for response 200
    def test_index(self):
        tester = app.test_client(self)
        response = tester.get("/time")
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)

    def test_index_content(self):
        tester = app.test_client(self)
        response = tester.get("/time")
        self.assertEqual(response.content_type, "application/json")

    def login(self, username, password):
        return app.test_client(self).post('/login', json = {
        "username" : username,
        "password" : password
        })

    def test_valid_login(self):
        response = self.login('1', '1')
        self.assertEqual(response.get_json()["status"], 200)
        self.assertEqual(response.get_json()["username"], '1')
    
    def test_invalid_login(self):
        response = self.login('1', 'ab2c')
        self.assertEqual(response.get_json()["status"], 404)
        self.assertEqual(response.get_json()["message"], 'Wrong username of password')
        

if __name__ == "__main__":
    unittest.main()