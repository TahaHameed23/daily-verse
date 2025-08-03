import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";
import { verseManager } from "./verseManager";
import { storageService } from "./storage";
import { widgetService } from "./widgetService";

class BackgroundRefreshService {
    private refreshInterval: NodeJS.Timeout | null = null;
    private lastRefreshTime: number = 0;
    private isActive: boolean = true;
    private appStateSubscription: any = null;

    /**
     * Initialize the background refresh service
     */
    async initialize() {
        try {
            // Get last refresh time
            const lastRefresh = await AsyncStorage.getItem("lastAutoRefresh");
            this.lastRefreshTime = lastRefresh ? parseInt(lastRefresh) : 0;

            // Start the refresh check
            this.startRefreshCheck();

            // Listen for app state changes
            this.appStateSubscription = AppState.addEventListener(
                "change",
                this.handleAppStateChange
            );

            console.log("Background refresh service initialized");
        } catch (error) {
            console.error(
                "Failed to initialize background refresh service:",
                error
            );
        }
    }

    /**
     * Clean up the service
     */
    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        if (this.appStateSubscription) {
            this.appStateSubscription.remove();
            this.appStateSubscription = null;
        }
    }

    /**
     * Handle app state changes
     */
    private handleAppStateChange = (nextAppState: AppStateStatus) => {
        this.isActive = nextAppState === "active";

        if (this.isActive) {
            // When app becomes active, check if refresh is needed
            this.checkAndRefreshIfNeeded();
        }
    };

    /**
     * Start the refresh check interval
     */
    private startRefreshCheck() {
        // Check every 5 minutes when app is active
        this.refreshInterval = setInterval(() => {
            if (this.isActive) {
                this.checkAndRefreshIfNeeded();
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    /**
     * Check if refresh is needed based on settings and time
     */
    async checkAndRefreshIfNeeded() {
        try {
            const settings = await storageService.getSettings();

            if (settings.refreshFrequency === "manual") {
                return; // No auto refresh for manual mode
            }

            const now = Date.now();
            const timeSinceLastRefresh = now - this.lastRefreshTime;
            const refreshInterval = this.getRefreshInterval(
                settings.refreshFrequency
            );

            console.log(
                `Time since last refresh: ${Math.round(
                    timeSinceLastRefresh / 1000 / 60
                )} minutes`
            );
            console.log(
                `Refresh interval: ${Math.round(
                    refreshInterval / 1000 / 60
                )} minutes`
            );

            if (timeSinceLastRefresh >= refreshInterval) {
                console.log("Auto-refreshing verse based on settings...");
                await this.performAutoRefresh();
            }
        } catch (error) {
            console.error("Failed to check refresh status:", error);
        }
    }

    /**
     * Get refresh interval in milliseconds based on frequency setting
     */
    private getRefreshInterval(frequency: string): number {
        switch (frequency) {
            case "hourly":
                return 60 * 60 * 1000; // 1 hour
            case "every2hours":
                return 2 * 60 * 60 * 1000; // 2 hours
            case "daily":
                return 24 * 60 * 60 * 1000; // 24 hours
            case "weekly":
                return 7 * 24 * 60 * 60 * 1000; // 7 days
            default:
                return 2 * 60 * 60 * 1000; // Default to 2 hours
        }
    }

    /**
     * Perform the actual refresh
     */
    private async performAutoRefresh() {
        try {
            console.log("Performing auto-refresh...");

            // Get new verse
            const verseData = await verseManager.refreshVerse();

            // Update last refresh time
            this.lastRefreshTime = Date.now();
            await AsyncStorage.setItem(
                "lastAutoRefresh",
                this.lastRefreshTime.toString()
            );

            // Update widget if available
            const settings = await storageService.getSettings();
            await widgetService.updateWidget(
                verseData.verse,
                verseData.chapter,
                settings
            );

            console.log("Auto-refresh completed successfully");

            // Store a flag that auto-refresh happened
            await AsyncStorage.setItem("autoRefreshOccurred", "true");
        } catch (error) {
            console.error("Failed to perform auto-refresh:", error);
        }
    }

    /**
     * Check if auto-refresh occurred (for UI to detect)
     */
    async checkAutoRefreshOccurred(): Promise<boolean> {
        try {
            const occurred = await AsyncStorage.getItem("autoRefreshOccurred");
            if (occurred === "true") {
                await AsyncStorage.removeItem("autoRefreshOccurred");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to check auto-refresh status:", error);
            return false;
        }
    }

    /**
     * Manually trigger refresh (resets timer)
     */
    async manualRefresh() {
        await this.performAutoRefresh();
    }

    /**
     * Reset the refresh timer (call when user manually refreshes)
     */
    async resetRefreshTimer() {
        this.lastRefreshTime = Date.now();
        await AsyncStorage.setItem(
            "lastAutoRefresh",
            this.lastRefreshTime.toString()
        );
    }

    /**
     * Get time until next auto refresh
     */
    async getTimeUntilNextRefresh(): Promise<{
        hours: number;
        minutes: number;
    } | null> {
        try {
            const settings = await storageService.getSettings();

            if (settings.refreshFrequency === "manual") {
                return null;
            }

            const refreshInterval = this.getRefreshInterval(
                settings.refreshFrequency
            );
            const timeSinceLastRefresh = Date.now() - this.lastRefreshTime;
            const timeUntilNext = refreshInterval - timeSinceLastRefresh;

            if (timeUntilNext <= 0) {
                return { hours: 0, minutes: 0 };
            }

            const hours = Math.floor(timeUntilNext / (60 * 60 * 1000));
            const minutes = Math.floor(
                (timeUntilNext % (60 * 60 * 1000)) / (60 * 1000)
            );

            return { hours, minutes };
        } catch (error) {
            console.error(
                "Failed to calculate time until next refresh:",
                error
            );
            return null;
        }
    }
}

export const backgroundRefreshService = new BackgroundRefreshService();
