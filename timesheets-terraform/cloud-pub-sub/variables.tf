#

variable "topic_names" {
    type = set(string)
    default = ["default-topic"]
} 
variable "project_id" {
    type = string
}
