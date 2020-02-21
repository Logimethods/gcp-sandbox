locals {
    gcs_bn          = "gcp-sandbox-266014_2"
    gcs_fn_cf_files = "files-${lower(replace(base64encode(data.archive_file.cf_files_zip.output_md5), "=", ""))}.zip"
    gcs_fn_cf_oauth = "files-${lower(replace(base64encode(data.archive_file.cf_oauth_zip.output_md5), "=", ""))}.zip"
    gcs_fn_cf_view  = "files-${lower(replace(base64encode(data.archive_file.cf_view_zip.output_md5), "=", ""))}.zip"

    gps_topic_cron  = "from-cron-topic"
    gps_topic_month = "monthly-topic"
    gps_topic_week  = "weekly-topic"
}

provider "google" {
  project = "${var.gcp_project}"
  region  = "${var.gcp_region}"
  version = "~> 3.9.0"
}

provider "archive" {
  version = "~> 1.3.0"
}

data "archive_file" "cf_files_zip" {
    type        = "zip"
    output_path = "${path.root}/cf_files.zip"
    
    source {
        content     = file("./cloud-functions/nodejs_functions/fetch_files/index.js")
        filename    = "index.js"
    }
    source {
        content     = file("./cloud-functions/nodejs_functions/fetch_files/package.json")
        filename    = "package.json"
    }
}
data "archive_file" "cf_oauth_zip" {
    type        = "zip"
    output_path = "${path.root}/cf_oauth.zip"

    source {
        content     = file("./cloud-functions/nodejs_functions/oauth/index.js")
        filename    = "index.js"
    }
    source {
        content     = file("./cloud-functions/nodejs_functions/oauth/package.json")
        filename    = "package.json"
    }
    source {
        content     = file("./cloud-functions/nodejs_functions/oauth/credentials.json")
        filename    = "credentials.json"
    }
}

data "archive_file" "cf_view_zip" {
    type        = "zip"
    output_path = "${path.root}/cf_view.zip"

    source {
        content     = file("./cloud-functions/nodejs_functions/view_status/index.js")
        filename    = "index.js"
    }
    source {
        content     = file("./cloud-functions/nodejs_functions/view_status/package.json")
        filename    = "package.json"
    }
    source {
        content     = file("./cloud-functions/nodejs_functions/view_status/views/query.ejs")
        filename    = "views/query.ejs"
    }
}

module "cloud_pub_sub" {
    source = "./cloud-pub-sub"
    topic_names = ["${local.gps_topic_cron}", "${local.gps_topic_month}", "${local.gps_topic_week}"]
    project_id     = "gcp-sandbox-266014"  
}

module "cloud_storage" {
    source  ="./cloud-storage"
    storage_bucket  = {
        name            = "${local.gcs_bn}"
        force_destroy   = true 
        location        = "us-east4"
    }
    storage_bucket_objects  = {
        files   = {
            name    =   "${local.gcs_fn_cf_files}"
            source  =   "${path.root}/cf_files.zip"
        },
        oauth   = {
            name    =   "${local.gcs_fn_cf_oauth}"
            source  =   "${path.root}/cf_oauth.zip"
        },
        view   = {
            name    =   "${local.gcs_fn_cf_view}"
            source  =   "${path.root}/cf_view.zip"
        }
    }
}

module "cloud_function" {
    source = "./cloud-functions"
    

    cloud_function_definitions = {
        fetchDriveFiles   = {
            name                  = "fetchDriveFiles"
            source_archive_bucket = "${local.gcs_bn}"
            #source_archive_object = "${module.cloud_storage.storage_bucket_objects.files.name}"
            source_archive_object   = "${local.gcs_fn_cf_files}"
            #"files"
            trigger_http          = null
            runtime               = "nodejs10"
            entry_point           = "fetchDriveFiles"
            region                = "us-east4"
            event_trigger  = {
                event_type    = "google.pubsub.topic.publish"
                resource      = "${local.gps_topic_cron}"
            }
        },
        monthlyProcess   = {
            name                  = "monthlyProcess"
            source_archive_bucket = "${local.gcs_bn}"
            source_archive_object = "${local.gcs_fn_cf_files}"
            trigger_http          = null
            runtime               = "nodejs10"
            entry_point           = "monthlyProcess"
            region                = "us-east4"
            event_trigger  = {
                event_type    = "google.pubsub.topic.publish"
                resource      = "${local.gps_topic_month}"
            }
        },
        weeklyProcess   = {
            name                  = "weeklyProcess"
            source_archive_bucket = "${local.gcs_bn}"
            source_archive_object = "${local.gcs_fn_cf_files}"
            trigger_http          = null
            runtime               = "nodejs10"
            entry_point           = "weeklyProcess"
            region                = "us-east4"
            event_trigger  = {
                event_type    = "google.pubsub.topic.publish"
                resource      = "${local.gps_topic_week}"
            }
        },
        showStatus   = {
            name                  = "showStatus"
            source_archive_bucket = "${local.gcs_bn}"
            source_archive_object = "${local.gcs_fn_cf_view}"
            trigger_http          = true
            runtime               = "nodejs10"
            entry_point           = "showStatus"
            region                = "us-east4"   
            event_trigger         = null         
        },
        updateAccessToken   = {
            name                  = "updateAccessToken"
            source_archive_bucket = "${local.gcs_bn}"
            source_archive_object = "${local.gcs_fn_cf_oauth}"
            trigger_http          = true
            runtime               = "nodejs10"
            entry_point           = "updateAccessToken"
            region                = "us-east4"
            event_trigger         = null
        }
    }
}

module "cloud_scheduler" {
    source = "./cloud-scheduler"


    cloud_schedulers   =  {
        weekly_1   = {
            project     = "gcp-sandbox-266014"
            name        = "timesheets_weekly"
            region      = "us-east4"
            timezone    = "America/New_York"
            schedule    = {"first" = "0 18 * * 5", "second" = "0 18 * * 6", "third" = "0 18 * * 0", "fourth" = "0 8 * * 1"}
            pubsub_target   = {
                topic_name  = "${local.gps_topic_cron}"
                data        = base64encode(jsonencode({"data": {"topic": "${local.gps_topic_week}"}}))
            }
        },
        monthly_1   = {
            project     = "gcp-sandbox-266014"
            name        = "timesheets_monthly"
            region      = "us-east4"
            timezone    = "America/New_York"
            schedule    = {"first" = "0 8 1 * *", "second" = "0 8 2 * *", "third" = "0 8 3 * *", "fourth" = "0 8 4 * *", "fifth" = "0 8 5 * *"}
            pubsub_target   = {
                topic_name  = "${local.gps_topic_cron}"
                data        = base64encode(jsonencode({"data": {"topic": "${local.gps_topic_month}"}}))
            }
        }
    }    
}

/*
module "cloudsql_mysql" {
  source = "./terraform-google-cloudsql-ha"

  general = {
    name       = "mysql-1"
    env        = "sandbox"
    region     = "us-east4"
    db_version = "MYSQL_5_7"
  }

  master = {
    zone = "a"
  }

  replica = {
    zone = "b"
  }

  dbuser = {
      name      = "dbuser"
      host      = "%"
      password  = "password"
  }
}
*/