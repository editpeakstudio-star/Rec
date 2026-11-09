import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  FileCode2, 
  FolderTree, 
  Play, 
  ShieldCheck, 
  AlertTriangle,
  Smartphone
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  path: string;
  lang: string;
  description: string;
  content: string;
}

const FILES: FileItem[] = [
  {
    id: 'settings-gradle',
    name: 'settings.gradle',
    path: 'settings.gradle',
    lang: 'groovy',
    description: 'Root project settings and module inclusion',
    content: `rootProject.name = "CallRecorder"
include ':app'
`,
  },
  {
    id: 'build-gradle-root',
    name: 'build.gradle (Root)',
    path: 'build.gradle',
    lang: 'groovy',
    description: 'Root build configuration with Android Gradle Plugin 8.5.0',
    content: `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.5.0'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`,
  },
  {
    id: 'app-build-gradle',
    name: 'app/build.gradle',
    path: 'app/build.gradle',
    lang: 'groovy',
    description: 'App module configuration (minSdk 21, targetSdk 34, compileSdk 34)',
    content: `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.example.callrecorder'
    compileSdk 34

    defaultConfig {
        applicationId "com.example.callrecorder"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'com.google.android.material:material:1.12.0'
}
`,
  },
  {
    id: 'android-manifest',
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    lang: 'xml',
    description: 'App permissions, Foreground Service (type: microphone), and BroadcastReceiver',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.example.callrecorder">

    <!-- Permissions required for Call Detection & Recording -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <!-- Legacy Storage Permissions for older Android versions -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/ic_btn_speak_now"
        android:label="Call Recorder"
        android:roundIcon="@android:drawable/ic_btn_speak_now"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.DarkActionBar"
        android:requestLegacyExternalStorage="true">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Broadcast Receiver for Call State Changes -->
        <receiver
            android:name=".CallReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.PHONE_STATE" />
                <action android:name="android.intent.action.NEW_OUTGOING_CALL" />
            </intent-filter>
        </receiver>

        <!-- Foreground Service for Continuous Audio Capture -->
        <service
            android:name=".RecordingService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="microphone" />

    </application>

</manifest>
`,
  },
  {
    id: 'main-activity',
    name: 'MainActivity.java',
    path: 'app/src/main/java/com/example/callrecorder/MainActivity.java',
    lang: 'java',
    description: 'Dynamic Runtime Permission check & Start/Stop Service manual testing UI',
    content: `package com.example.callrecorder;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQ_CODE = 1001;
    private TextView statusTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Simple programmatic UI layout without requiring XML layout file
        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(60, 80, 60, 60);

        TextView titleView = new TextView(this);
        titleView.setText("Auto Call Recorder (API 34)");
        titleView.setTextSize(22);
        titleView.setTypeface(null, android.graphics.Typeface.BOLD);
        titleView.setPadding(0, 0, 0, 40);
        layout.addView(titleView);

        statusTextView = new TextView(this);
        statusTextView.setText("Status: Monitoring calls in background");
        statusTextView.setTextSize(16);
        statusTextView.setPadding(0, 0, 0, 60);
        layout.addView(statusTextView);

        Button btnStart = new Button(this);
        btnStart.setText("Start Service (Test Manual)");
        btnStart.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent serviceIntent = new Intent(MainActivity.this, RecordingService.class);
                serviceIntent.setAction(RecordingService.ACTION_START_RECORDING);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(serviceIntent);
                } else {
                    startService(serviceIntent);
                }
                statusTextView.setText("Status: Recording Service Started");
            }
        });
        layout.addView(btnStart);

        Button btnStop = new Button(this);
        btnStop.setText("Stop Service");
        btnStop.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent serviceIntent = new Intent(MainActivity.this, RecordingService.class);
                serviceIntent.setAction(RecordingService.ACTION_STOP_RECORDING);
                startService(serviceIntent);
                statusTextView.setText("Status: Recording Service Stopped");
            }
        });
        layout.addView(btnStop);

        setContentView(layout);

        checkAndRequestPermissions();
    }

    private void checkAndRequestPermissions() {
        List<String> neededPermissions = new ArrayList<>();

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.RECORD_AUDIO);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.READ_PHONE_STATE);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                neededPermissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                neededPermissions.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }
        }

        if (!neededPermissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, neededPermissions.toArray(new String[0]), PERMISSION_REQ_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQ_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (!allGranted) {
                Toast.makeText(this, "Permissions are required for call recording to work.", Toast.LENGTH_LONG).show();
            }
        }
    }
}
`,
  },
  {
    id: 'call-receiver',
    name: 'CallReceiver.java',
    path: 'app/src/main/java/com/example/callrecorder/CallReceiver.java',
    lang: 'java',
    description: 'BroadcastReceiver detecting RINGING, OFFHOOK (starts recording), and IDLE (stops recording)',
    content: `package com.example.callrecorder;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.telephony.TelephonyManager;
import android.util.Log;

public class CallReceiver extends BroadcastReceiver {

    private static final String TAG = "CallReceiver";
    private static int lastState = TelephonyManager.CALL_STATE_IDLE;
    private static boolean isIncoming = false;

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action == null) return;

        if (action.equals(Intent.ACTION_NEW_OUTGOING_CALL)) {
            isIncoming = false;
            Log.d(TAG, "Outgoing call initiated");
            return;
        }

        if (action.equals(TelephonyManager.ACTION_PHONE_STATE_CHANGED)) {
            String stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
            if (stateStr == null) return;

            int state = TelephonyManager.CALL_STATE_IDLE;
            if (stateStr.equals(TelephonyManager.EXTRA_STATE_RINGING)) {
                state = TelephonyManager.CALL_STATE_RINGING;
            } else if (stateStr.equals(TelephonyManager.EXTRA_STATE_OFFHOOK)) {
                state = TelephonyManager.CALL_STATE_OFFHOOK;
            } else if (stateStr.equals(TelephonyManager.EXTRA_STATE_IDLE)) {
                state = TelephonyManager.CALL_STATE_IDLE;
            }

            onCustomCallStateChanged(context, state);
        }
    }

    private void onCustomCallStateChanged(Context context, int state) {
        if (lastState == state) {
            return;
        }

        switch (state) {
            case TelephonyManager.CALL_STATE_RINGING:
                isIncoming = true;
                Log.d(TAG, "Call State: RINGING");
                break;

            case TelephonyManager.CALL_STATE_OFFHOOK:
                Log.d(TAG, "Call State: OFFHOOK (Call Answered / Dialing)");
                // Start Recording Service
                Intent startIntent = new Intent(context, RecordingService.class);
                startIntent.setAction(RecordingService.ACTION_START_RECORDING);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(startIntent);
                } else {
                    context.startService(startIntent);
                }
                break;

            case TelephonyManager.CALL_STATE_IDLE:
                Log.d(TAG, "Call State: IDLE (Call Ended)");
                // Stop Recording Service
                if (lastState == TelephonyManager.CALL_STATE_OFFHOOK) {
                    Intent stopIntent = new Intent(context, RecordingService.class);
                    stopIntent.setAction(RecordingService.ACTION_STOP_RECORDING);
                    context.startService(stopIntent);
                }
                isIncoming = false;
                break;
        }

        lastState = state;
    }
}
`,
  },
  {
    id: 'recording-service',
    name: 'RecordingService.java',
    path: 'app/src/main/java/com/example/callrecorder/RecordingService.java',
    lang: 'java',
    description: 'Foreground Service handling MediaRecorder audio capture and saving timestamped files to Recordings/Downloads',
    content: `package com.example.callrecorder;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.Environment;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class RecordingService extends Service {

    public static final String ACTION_START_RECORDING = "com.example.callrecorder.START_RECORDING";
    public static final String ACTION_STOP_RECORDING = "com.example.callrecorder.STOP_RECORDING";
    private static final String CHANNEL_ID = "CallRecorderChannel";
    private static final int NOTIFICATION_ID = 2001;
    private static final String TAG = "RecordingService";

    private MediaRecorder mediaRecorder;
    private boolean isRecording = false;
    private String currentFilePath;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            if (ACTION_START_RECORDING.equals(action)) {
                startForegroundWithNotification();
                startRecording();
            } else if (ACTION_STOP_RECORDING.equals(action)) {
                stopRecording();
                stopForeground(true);
                stopSelf();
            }
        }
        return START_NOT_STICKY;
    }

    private void startForegroundWithNotification() {
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Call Recorder Active")
                .setContentText("Recording call audio in background...")
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Call Recorder Service Channel",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows active status when call audio recording is in progress");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void startRecording() {
        if (isRecording) {
            Log.d(TAG, "Already recording. Skipping duplicate start.");
            return;
        }

        try {
            // Target storage directory: Downloads or App-accessible Recordings folder
            File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (dir == null || !dir.exists()) {
                dir = getExternalFilesDir(Environment.DIRECTORY_MUSIC);
            }
            if (dir != null && !dir.exists()) {
                dir.mkdirs();
            }

            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
            File recordingFile = new File(dir, "CallRecord_" + timestamp + ".m4a");
            currentFilePath = recordingFile.getAbsolutePath();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                mediaRecorder = new MediaRecorder(this);
            } else {
                mediaRecorder = new MediaRecorder();
            }

            // MediaRecorder.AudioSource.MIC is widely compatible across Android 10-14 devices
            mediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            mediaRecorder.setAudioEncodingBitRate(128000);
            mediaRecorder.setAudioSamplingRate(44100);
            mediaRecorder.setOutputFile(currentFilePath);

            mediaRecorder.prepare();
            mediaRecorder.start();
            isRecording = true;
            Log.i(TAG, "Call recording successfully started. Output: " + currentFilePath);

        } catch (IOException | IllegalStateException e) {
            Log.e(TAG, "Failed to start MediaRecorder: " + e.getMessage(), e);
            releaseRecorder();
        }
    }

    private void stopRecording() {
        if (!isRecording) return;

        try {
            if (mediaRecorder != null) {
                mediaRecorder.stop();
                Log.i(TAG, "Recording saved at: " + currentFilePath);
            }
        } catch (RuntimeException stopException) {
            Log.e(TAG, "Error stopping recorder (audio data may be short): " + stopException.getMessage());
        } finally {
            releaseRecorder();
            isRecording = false;
        }
    }

    private void releaseRecorder() {
        if (mediaRecorder != null) {
            try {
                mediaRecorder.reset();
                mediaRecorder.release();
            } catch (Exception ignored) {
            }
            mediaRecorder = null;
        }
    }

    @Override
    public void onDestroy() {
        stopRecording();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
`,
  },
];

export default function App() {
  const [selectedFileId, setSelectedFileId] = useState<string>('settings-gradle');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedFile = FILES.find((f) => f.id === selectedFileId) || FILES[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateFullBashScript = () => {
    let script = `#!/bin/bash
set -e

echo "=== Initializing CallRecorder Android Project (CLI) ==="

# Set Android SDK path if not already exported
export ANDROID_HOME=\${ANDROID_HOME:-$HOME/Android/Sdk}
echo "Using ANDROID_HOME: $ANDROID_HOME"

# Create directory structure
mkdir -p CallRecorder/app/src/main/java/com/example/callrecorder
mkdir -p CallRecorder/gradle/wrapper
cd CallRecorder

`;

    FILES.forEach((f) => {
      script += `# --- Create ${f.path} ---
cat > ${f.path} << 'EOF'
${f.content}EOF

`;
    });

    script += `# Setup local.properties with SDK location
cat > local.properties << EOF
sdk.dir=$ANDROID_HOME
EOF

# Initialize Gradle Wrapper (Gradle 8.7 is compatible with AGP 8.5.0)
if ! command -v gradle &> /dev/null; then
    echo "gradle CLI command not found. Installing wrapper manually or running gradle..."
fi
gradle wrapper --gradle-version 8.7 --distribution-type bin || echo "If gradle command is missing, ensure gradle is installed (sudo apt install gradle)"

chmod +x gradlew

echo "=== Building Debug APK with ./gradlew assembleDebug ==="
./gradlew assembleDebug

echo ""
echo "=== Build Successful! ==="
echo "Debug APK location: app/build/outputs/apk/debug/app-debug.apk"
`;

    return script;
  };

  const handleDownloadScript = () => {
    const script = generateFullBashScript();
    const blob = new Blob([script], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup_call_recorder.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Android 14 Call Recorder
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                API 34 CLI Project
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Terminal-ready Gradle 8.5.0, TelephonyManager, MediaRecorder, and Foreground Service setup
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(generateFullBashScript(), 'all-script')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
          >
            {copiedId === 'all-script' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy Complete Shell Script
          </button>
          <button
            onClick={handleDownloadScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Download className="w-4 h-4" />
            Download setup.sh
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: File Tree & Steps */}
        <aside className="w-full lg:w-80 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span>Project Files (7)</span>
            </div>
            <div className="space-y-1">
              {FILES.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-xs font-mono transition flex items-center justify-between ${
                    selectedFileId === file.id
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="truncate flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">{file.lang}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Technical Notes for API 34 */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Android 14 (API 34) Notes</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-300/80 leading-relaxed">
              <li>
                <strong>Foreground Service:</strong> Must declare <code className="bg-amber-950 px-1 rounded">foregroundServiceType="microphone"</code> and permission.
              </li>
              <li>
                <strong>MediaRecorder Source:</strong> Used <code className="bg-amber-950 px-1 rounded">AudioSource.MIC</code> because standard 3rd-party apps are restricted from direct cellular audio streams on Android 10+.
              </li>
              <li>
                <strong>Permissions:</strong> Dynamic check handles <code className="bg-amber-950 px-1 rounded">POST_NOTIFICATIONS</code> (API 33+) & microphone.
              </li>
            </ul>
          </div>

          {/* Quick Build Instructions */}
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Build & Deploy Commands</span>
            </div>
            <div className="font-mono text-[11px] bg-black/50 p-2 rounded text-slate-300 space-y-1 overflow-x-auto">
              <div># 1. Initialize Wrapper</div>
              <div className="text-emerald-400">gradle wrapper --gradle-version 8.7</div>
              <div># 2. Build APK</div>
              <div className="text-emerald-400">./gradlew assembleDebug</div>
              <div># 3. Install to device</div>
              <div className="text-emerald-400">adb install -r app/build/outputs/apk/debug/app-debug.apk</div>
            </div>
          </div>
        </aside>

        {/* Center/Right: Code Viewer & cat command preview */}
        <section className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* File Toolbar */}
          <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-white">{selectedFile.path}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedFile.lang}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleCopy(`cat > ${selectedFile.path} << 'EOF'\n${selectedFile.content}EOF`, selectedFile.id + '-cat')
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-emerald-400 transition"
              >
                {copiedId === selectedFile.id + '-cat' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Terminal className="w-3.5 h-3.5" />
                )}
                Copy cat &lt;&lt; 'EOF' Command
              </button>

              <button
                onClick={() => handleCopy(selectedFile.content, selectedFile.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition"
              >
                {copiedId === selectedFile.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy Raw Code
              </button>
            </div>
          </div>

          {/* Terminal cat command snippet bar */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="truncate">
              Shell command:&nbsp;
              <span className="text-emerald-400">cat &gt; {selectedFile.path} &lt;&lt; 'EOF'</span>
            </span>
            <span className="text-[11px] text-slate-500">Lines: {selectedFile.content.trim().split('\n').length}</span>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 overflow-auto p-6 bg-slate-950 font-mono text-xs leading-relaxed text-slate-200">
            <pre className="whitespace-pre overflow-x-auto selection:bg-emerald-500/30 selection:text-emerald-200">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Android 14 (API 34) Foreground Service & Permissions Compliant</span>
        </div>
        <span>Target: Linux CLI ($HOME/Android/Sdk)</span>
      </footer>
    </div>
  );
}
