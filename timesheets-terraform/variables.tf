variable "gcp_project" {
    type    = string
    default = "gcp-sandbox-266014"
}

variable "gcp_region" {
    type    = string
    default = "us-east4"
}

variable "service_account_key" {
    type = string
    #default = "terraform.key.json"
    default = <<SERVICE_ACCOUNT_KEY
    {
    "type": "service_account",
    "project_id": "gcp-sandbox-266014",
    "private_key_id": "db413b1de4d55f6c32eec666fa0ee8ecfea9b811",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCcjJYOK6lAFGNw\nlHzAQMGIIw/Xa+H6zNwDxQHALgLSzssFB+iiyBiSWkbd5r6anHLlyRMFZ66tz4MO\nUsy9hmYsoX7sWrAUsqGRy/UE5vt6PZ8GfDEp6dyJ5Fr9vP1i4z7g6S4IiGXiBwx8\nMEKkE6xS3oJLCAnJUn74yrvmA0awKbN5xQIhxDOtDuiZxfujPc7euT59Oa5WpK1G\nBP8BKaQ1x8BnzcHFWgFZNgygLOs6eQExMab8qR3MdYRGENnpLandr/4k1HIzxpNP\ndGym0JW6MlrkTFdVvV2FGF1GQLPW+t4XRtF1EPPbYNlCEnvs3jz0JBTB9VuUvlam\ndf4vCJ/VAgMBAAECggEATfD8wJ9iS8Ia5DE5jypucI4sU++leg3GuKW8QmdmBnjo\nwV93ppwDB9Kkl9RLL4UW+2rJ6pX9dRHsyRPWVcH1WuEo5RodsqBhKsql+cPajrjh\nVQQ+IgUKRSkJWG1gpnxHkQjnX14xg4BI6gfJFhGpaTTZH+wnmzFUgB/HvzQAXLIO\nhb8pMHDeUFJH6t644NWP1SW8JZYtO67k32DzaH0IvDo8w7O++iMPLhwZPehKFp+Z\n7QPNOohADJpoadMI3wLNpSExuoQBzjwoAymVXVHK76ypFp0lKOlA4pklvNoCDZRj\npG4IfgR5DYBGBWSl815ygkHOAbd34fgp0gE4hRobnQKBgQDXaOIr3CpTAXd9r0di\n2tNNmUD1nT2mVSrbAoAn7MgoHlu2Yd1AXtDv1j7lG9ZsEh7HLW0dAGMqYhpZpwZV\nQkV2G1lh3joJ2xF38nVNNGIzAPq0DWv+XN0WLkn0y3jYuf3BTCa1KNMvirPMysOV\nfACb7u8Xi6eIPstL2TPamy1SqwKBgQC6DFaICXBuJtoU1LWpFQDLJEUYswaPzTjS\nkU2plhl3b9gdZxsAMHREScR7ydbonQuRf4l9X+kxhhhgDprF6a9euyMcopLPdDEH\ncLlaoOSGgSOPfvptv1L0RucSl4ORJX11uhA7NbVeDa2kEJoHVo5DE8gwiP6sLo4r\nrqDLUV3XfwKBgDgwRKbaNDQYstmXChDwMaQRMM+gp38mwhoEyfcgHYnReWzWlEcB\nNJELGrbajxD7nQmpgMfK3RMmKedu2QkOU14efi84L314plLabNypqF/ThpHG2n+s\nK4NoqaPwG2K1CUsNmR8yOfwxuvrVfTUV9na2WamTpSy17IOpcYw5ZBYnAoGAFmGd\nl0frapTp70+Xevu32LhIR6xhwbLifxJT0W7pKWEfEopwyRkLI5vsMygY3mrmFV7O\nX3LGTtre289l9yEho7fHhY5ZMvO7YjXBVpG8bCHk8UJJRiKaDCDrc2UewrtL2HnF\nshnH88SZev80SGW1P4SFtLEGUhhXqhGb7lmffGkCgYAD5bXcDrX4eiaOZw4RZXyH\nUUjeNL3nX0RncEDbuJQXPPAsRD1Put4cufRug6RUuJDP3k/Nh/kmSKzGMBFk+Xfu\nFKYEOkwT35JlOjJYC5EBaFdOomTBPYaaQcZqoJ+HSWxXdLaWUCiiTadOVDHuKGx0\nMyYeTRsBPRO61zEQui7ooQ==\n-----END PRIVATE KEY-----\n",
    "client_email": "timesheets-tf@gcp-sandbox-266014.iam.gserviceaccount.com",
    "client_id": "112861616988494476011",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/timesheets-tf%40gcp-sandbox-266014.iam.gserviceaccount.com"
    }
    SERVICE_ACCOUNT_KEY
}