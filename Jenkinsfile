pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        
        // ── Jenkins Docker Plugin එක පාවිච්චි කරලා ලස්සනට බිල්ඩ් කරනවා ──
        stage('Build Frontend Image') {
            steps {
                script {
                    echo 'Building Frontend Image using Jenkins Docker Tool...'
                    // sh 'docker build' වෙනුවට plugin එක පාවිච්චි කිරීම:
                    docker.build("uniflow-frontend:latest", "./frontend")
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    echo 'Building Backend Image using Jenkins Docker Tool...'
                    docker.build("uniflow-backend:latest", "./backend")
                }
            }
        }

        stage('Success Notification') {
            steps {
                echo '🎉 UniFlowEvents CI Build successfully validated by Jenkins!'
            }
        }
    }
}