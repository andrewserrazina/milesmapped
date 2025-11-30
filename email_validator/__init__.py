class EmailNotValidError(ValueError):
    pass


class ValidatedEmail:
    def __init__(self, email: str):
        self.email = email
        self.normalized = email
        if "@" in email:
            self.local_part = email.split("@", 1)[0]
        else:
            self.local_part = email


def validate_email(email: str, *args, **kwargs) -> ValidatedEmail:
    return ValidatedEmail(email)
