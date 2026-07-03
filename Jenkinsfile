pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        stage('Build Frontend Image') {
            steps {
                echo 'Building Frontend Image using Docker...'
                sh 'docker build -t uniflow-frontend:latest ./frontend'
            }
        }
        stage('Build Backend Image') {
            steps {
                echo 'Building Backend Image using Docker...'
                sh 'docker build -t uniflow-backend:latest ./backend'
            }
        }
        stage('Success Notification') {
            steps {
                echo '🎉 UniFlowEvents CI Build successfully validated by Jenkins!'
            }
        }
    }
}