resource "google_pubsub_topic" "topic" {
    for_each = var.topic_names

    name = each.value
    project = var.project_id
}

