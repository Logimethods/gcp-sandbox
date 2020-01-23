module "cloudsql-mysql" {
  source = "./terraform-google-cloudsql-ha"

  general = {
    name       = "mysql-1"
    env        = "sandbox"
    region     = "us-east4"
    db_version = "MYSQL_5_7"
  }

  master = {
    zone = "a"
#    tier = "db-n1-standard-1"
#    disk_size = 10
#    disk_auto = false
  }

  replica = {
    zone = "b"
#    tier = "db-n1-standard-1"
#    disk_size = 10
#    disk_auto = false
  }
}