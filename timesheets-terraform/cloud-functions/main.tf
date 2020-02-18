
resource "google_pubsub_topic" "source_topic" {
  name = "from-cron-topic"
}  

resource "google_pubsub_topic" "monthly_topic" {
  name = "monthly-topic"
}  

resource "google_pubsub_topic" "weekly_topic" {
  name = "weekly-topic"
}  

# Upload function (object) in Cloud Storage
# https://www.terraform.io/docs/providers/google/r/storage_bucket_object.html
/*
resource "google_storage_bucket_object" "db_function" {
    name    = "${lookup(var.cloud_function_definition, "bucket_archive_name")}"
    bucket  = "${lookup(var.cloud_function_definition, "bucket_name")}"
    source  = "${lookup(var.cloud_function_definition, "local_path")}"
}
*/
resource "google_storage_bucket" "my_bucket" {
    name    = "gcp-sandbox-266014_1"
    force_destroy = true
    location    = "us-east4"
}
resource "google_storage_bucket_object" "my_bucket_object" {
    name    = "files"
    bucket  = "${google_storage_bucket.my_bucket.name}"
    source  = "./nodejs_functions/fetch_files/cf_files.zip"
}
resource "google_storage_bucket_object" "my_bucket_object_1" {
    name    = "oauth"
    bucket  = "${google_storage_bucket.my_bucket.name}"
    source  = "./nodejs_functions/oauth/cf_oauth.zip"
}

resource "google_cloudfunctions_function" "fetchDriveFiles" {
  name                  = "fetchDriveFiles"
  source_archive_bucket = "${google_storage_bucket.my_bucket.name}"
  source_archive_object = "${google_storage_bucket_object.my_bucket_object.name}"
  runtime               = "nodejs10"
  entry_point           = "fetchDriveFiles"
  region                = "us-east4"
  event_trigger    {
      event_type    = "google.pubsub.topic.publish"
      resource      =   "${google_pubsub_topic.source_topic.name}"
  }
}
resource "google_cloudfunctions_function" "monthlyProcess" {
  name                  = "monthlyProcess"
  source_archive_bucket = "${google_storage_bucket.my_bucket.name}"
  source_archive_object = "${google_storage_bucket_object.my_bucket_object.name}"
  runtime               = "nodejs10"
  entry_point           = "monthlyProcess"
  region                = "us-east4"
  event_trigger    {
      event_type    = "google.pubsub.topic.publish"
      resource      =   "${google_pubsub_topic.monthly_topic.name}"
  }
}

resource "google_cloudfunctions_function" "weeklyProcess" {
  name                  = "weeklyProcess"
  source_archive_bucket = "${google_storage_bucket.my_bucket.name}"
  source_archive_object = "${google_storage_bucket_object.my_bucket_object.name}"
  runtime               = "nodejs10"
  entry_point           = "weeklyProcess"
  region                = "us-east4"
  event_trigger    {
      event_type    = "google.pubsub.topic.publish"
      resource      =   "${google_pubsub_topic.weekly_topic.name}"
  }
}

resource "google_cloudfunctions_function" "updateAccessToken" {
  name                  = "updateAccessToken"
  source_archive_bucket = "${google_storage_bucket.my_bucket.name}"
  source_archive_object = "${google_storage_bucket_object.my_bucket_object_1.name}"
  trigger_http          = true
  runtime               = "nodejs10"
  entry_point           = "updateAcessToken"
  region                = "us-east4"
} 

resource "google_cloudfunctions_function_iam_member" "updateAccessTokenInvoker" {
  project        = google_cloudfunctions_function.updateAccessToken.project
  region         = google_cloudfunctions_function.updateAccessToken.region
  cloud_function = google_cloudfunctions_function.updateAccessToken.name

  role   = "roles/cloudfunctions.invoker"
  member = "serviceAccount:service-670699301283@gcf-admin-robot.iam.gserviceaccount.com"
}

/*
# Create new CloudFunction
# https://www.terraform.io/docs/providers/google/r/cloudfunctions_function.html
resource "google_cloudfunctions_function" "function" {
  name                  = "${lookup(var.cloud_function_definition, "function_name")}"
  description           = "${lookup(var.cloud_function_definition, "function_description")}"
  available_memory_mb   = "${lookup(var.cloud_function_definition, "function_memory")}"
  source_archive_bucket = "${lookup(var.cloud_function_definition, "bucket_name")}"
  source_archive_object = "${lookup(var.cloud_function_definition, "bucket_archive_name")}"
  trigger_http          = true
  runtime               = "nodejs10"
  timeout               = "${lookup(var.cloud_function_definition, "function_timeout")}"
  entry_point           = "${lookup(var.cloud_function_definition, "function_entry_point")}"
}
*/