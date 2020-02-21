resource "google_cloudfunctions_function" "function" {
    for_each = var.cloud_function_definitions

    name                    = each.value.name
    source_archive_bucket   = each.value.source_archive_bucket
    source_archive_object   = each.value.source_archive_object
    trigger_http            = each.value.trigger_http
    runtime                 = each.value.runtime
    entry_point             = each.value.entry_point
    region                  = each.value.region
    dynamic "event_trigger" {
        for_each = each.value.event_trigger == null ? [] : list(each.value.event_trigger)
        content {
            event_type    = "${each.value.event_trigger == null ? null : each.value.event_trigger.event_type}"
            resource      = "${each.value.event_trigger == null ? null : each.value.event_trigger.resource}"
        }
    }
} 

/*
resource "google_cloudfunctions_function_iam_member" "updateAccessTokenInvoker" {
  project        = google_cloudfunctions_function.updateAccessToken.project
  region         = google_cloudfunctions_function.updateAccessToken.region
  cloud_function = google_cloudfunctions_function.updateAccessToken.name

  role   = "roles/cloudfunctions.invoker"
  member = "serviceAccount:service-670699301283@gcf-admin-robot.iam.gserviceaccount.com"
}*/

