package com.example.track;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Binder;
import android.os.IBinder;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresPermission;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Random;

public class LocationService extends Service {
    public static final String CHANNEL_ID_STRING = "service_01";
    public static final String DATA_FILENAME = "locations.json";
    MainActivity mainActivity = null;
    Location lastLocation = null;
    String locations = "[]";

    public LocationService() {
    }

    // Binder given to clients
    private final IBinder binder = new LocalBinder();
    // Random number generator
    private final Random mGenerator = new Random();

    /**
     * Class used for the client Binder.  Because we know this service always
     * runs in the same process as its clients, we don't need to deal with IPC.
     */
    public class LocalBinder extends Binder {
        LocationService getService() {
            // Return this instance of LocalService so clients can call public methods
            return LocationService.this;
        }
    }

    @RequiresPermission(Manifest.permission.ACCESS_FINE_LOCATION)
    @Override
    public void onCreate() {
        super.onCreate();
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel mChannel = new NotificationChannel(CHANNEL_ID_STRING, getString(R.string.app_name),
                NotificationManager.IMPORTANCE_LOW);
        notificationManager.createNotificationChannel(mChannel);
        Notification notification =
                new Notification.Builder(this, CHANNEL_ID_STRING)
                        .build();
        startForeground(1, notification);

        try {
            FileInputStream fis = LocationService.this.openFileInput(DATA_FILENAME);
            InputStreamReader inputStreamReader =
                    new InputStreamReader(fis, StandardCharsets.UTF_8);
            StringBuilder stringBuilder = new StringBuilder();
            BufferedReader reader = new BufferedReader(inputStreamReader);
            String line = reader.readLine();
            while (line != null) {
                stringBuilder.append(line).append('\n');
                line = reader.readLine();
            }
            locations = stringBuilder.toString();
            Log.d(DATA_FILENAME, stringBuilder.toString());
            Log.d(DATA_FILENAME, this.getFilesDir().getPath());
        } catch (Exception e) {
            e.printStackTrace();
        }

        LocationManager manager = (LocationManager) getApplicationContext().getSystemService(Context.LOCATION_SERVICE);
        LocationListener listener = new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {

                Date date = new Date(location.getTime());
                SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS+08:00", Locale.CHINA);
                String time = format.format(date);
                float[] results = new float[]{0};
                if (lastLocation != null) {
                    Location.distanceBetween(lastLocation.getLatitude(), lastLocation.getLongitude(), location.getLatitude(), location.getLongitude(), results);
                }

                @SuppressLint("DefaultLocale")
                String info = String.format("{\n" +
                                "\"latitude\": %f,\n" +
                                "\"longitude\": %f,\n" +
                                "\"altitude\": %f\n" +
                                "\"accuracy\": %f\n" +
                                "\"verticalAccuracy\": %f\n" +
                                "\"speed\": %f\n" +
                                "\"speedAccuracy\": %f\n" +
                                "\"time\": %s\n" +
                                "}",
                        location.getLatitude(),
                        location.getLongitude(),
                        location.getAltitude(),
                        location.getAccuracy(),
                        location.getVerticalAccuracyMeters(),
                        location.getSpeed(),
                        location.getSpeedAccuracyMetersPerSecond(),
                        time);
                Toast.makeText(LocationService.this, "" + (mainActivity != null) + results[0], Toast.LENGTH_SHORT).show();
                locations = locations.replaceAll("]$", (locations.trim().length() == 2 ? "" : ",") + info + "]");
                pushLocations();
                lastLocation = location;
            }
        };
        manager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 1, listener);
//        manager.removeUpdates(listener);
    }

    public IBinder onBind(Intent intent) {
        return binder;
    }


    /**
     * method for clients
     */
    public int getRandomNumber() {
        Toast.makeText(LocationService.this, "123", Toast.LENGTH_SHORT).show();
        return mGenerator.nextInt(100);
    }

    public void setMainActivity(MainActivity mainActivity) {
        this.mainActivity = mainActivity;
    }

    public void pushLocations() {
        if (mainActivity != null) {
            mainActivity.pushLocations(locations);
            locations = "[]";
        }
    }

    public void save() {
        try {
            File file = new File(this.getFilesDir(), DATA_FILENAME);
            if (!file.exists()) {
                file.createNewFile();
            }
            FileOutputStream fos = this.openFileOutput(DATA_FILENAME, Context.MODE_PRIVATE);
            fos.write(locations.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}