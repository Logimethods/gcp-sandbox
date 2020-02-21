locals {
    schedulers = flatten([
        for cloud_scheduler in var.cloud_schedulers : [
            for k, v in cloud_scheduler.schedule : {
                project         =  cloud_scheduler.project
                name            =  "${cloud_scheduler.name}-${k}"
                region          =  cloud_scheduler.region
                time_zone       =  cloud_scheduler.timezone
                schedule        =  v
                topic_name      = cloud_scheduler.pubsub_target.topic_name
                data            = cloud_scheduler.pubsub_target.data
            }
        ]
    ])
}

resource "google_cloud_scheduler_job" "cron_job" {
    for_each    = {
        for scheduler in local.schedulers : "${scheduler.project}${scheduler.name}.${scheduler.region}.${scheduler.time_zone}.${scheduler.schedule}.${scheduler.topic_name}.${scheduler.data}" => scheduler 
    }
    project         =  each.value.project
    name            =  each.value.name
    #each.value.name
    region          =  each.value.region
    time_zone       =  each.value.time_zone
    schedule        =  each.value.schedule


    pubsub_target   {
        topic_name  = "projects/${each.value.project}/topics/${each.value.topic_name}"
        data        = each.value.data
    }
}