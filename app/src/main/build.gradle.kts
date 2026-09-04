plugins {
    id("com.android.application")
}

android {
    namespace = "com.caro.mobility"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.caro.mobility"
        minSdk = 26
        targetSdk = 36
        versionCode = 4
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.webkit:webkit:1.8.0")
    implementation("com.google.android.material:material:1.12.0")
}