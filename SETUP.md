# Setup
This installation guide assumes that you are using Ubuntu 22.04 and have general familarity with linux (cli, package management, systemctl). It also assumes that you have installed and configured sudo (which should already be the case in most ubuntu versions).

We will be installing:
- Postgresql 11
- Redis 
- Node.js 14+

If you need the articles and documentation I referenced:
https://www.radishlogic.com/postgresql/how-to-install-a-specific-version-of-postgresql-in-ubuntu/
https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/
https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04
https://www.baeldung.com/linux/systemd-create-user-services

This is just a guide based on my own observation and personal tinkering. It should not be considered a de-facto manual. Make sure you know what you are doing, or at the very least, check the individual documentation of each package. I am not reponsible for anything that goes wrong as things change.

*Pre-requisites*
Make sure you have gpg, curl, and lsb-release as they are used to configure new apt repositories and validate them.

```
sudo apt-get install lsb-release curl gpg
```

## Postgres

Installation
```
# Fetch the apt repository configuration file from the official postgres website.
$ sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Import the repository signing key
$ wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null

# Update list of available packages
$ sudo apt update

# Install postgresql-11 and postgresql-client-11
$ sudo apt install postgresql-11 postgresql-client-11

# Enable postgres in systemd
$ sudo systemctl enable --now postgresql
```

Configuration
```
# Log into the 'postgres' user and sign into postgresql 
$ sudo su postgres 
$ psql

# Create the logger role and database, then give it the permissions it needs.
postgres=\# CREATE ROLE logger;
postgres=\# CREATE database logger;
postgres=\# GRANT ALL PRIVILEGES ON DATABASE logger TO logger;
postgres=\# ALTER ROLE "logger" WITH login; # Allows the user to sign in
postgres=\# ALTER ROLE "logger" WITH password "$PASSWORD"; # Set your own password here
postgres=\# ALTER ROLE "logger" WITH SUPERUSER; 

# Exit
postgres=\# \q
```

Now you should have a user called "logger" with the ability to login, along with superuser access to the database 'logger'.


## Redis
Probably the easiest out of all the depenedencies

```
# Fetch the keyring and add the redis repository to your sources list.
sudo apt-get install lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update

# Install Redis and enable it
$ sudo apt install redis
$ sudo systemctl enable --now redis-server
```

## Node
Installation 
```
$ cd ~
$ curl -sL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh
$ sudo bash /tmp/nodesource_setup.sh

# Validate that node is installed
node -v
```

The script will do the same thing you've done for both the redis and postgres apt repositories.


## Discord Developer Portal
If you already know how to set up a discord bot, then you can skip this section.

Head to the [discord developer portal](https://discord.com/developers/applications/1131434920452046848/oauth2) and follow these steps. 

1. Create a new Application
2. Click on "Bot" in the sidebar and reset the token (COPY IT and save it somwhere, as it won't show you the token again without resetting it.)
3. Scroll down to the "Privileged Gateway Intents" section and enable "Server members Intent" and "Message Content Intent".
4. Click on  "General Information" in the sidebar, then copy the Application ID.
5. Visit discord's bot calculator website [website](https://discordapi.com/permissions.html).
6. I suggest giving the bot the Administrator permission as it will need to see every channel in the server (so it can log deleted messages and such). 
7. After selecting the privileges you want, head to the "OAuth Url Generator" section and paste your appliation ID in the "Client ID" section.
8. Copy and paste the link into a new tab, then add your bot to the server you want it in.



## "Optional" depenedencies
If you want to install the haste pastebin server, follow the setups below. Otherwise, skip this section.


## Node Configuration
Now that you've installed node, postgres, redis, and the application itself, it is time to configure the setup script for TizzyLog.

Copy .env.example to .env

Edit .env with your preferred text editor, you should see something like this:
```
AES_KEY=yourAESKey  # The key used for AES encryption. Can be any ASCII string of any length.␍
BEZERK_URI=ws://localhost:1234  # URI for Bezerk https://github.com/thesharks/bezerk. Leave blank if not using (it's NOT required).␍
BEZERK_SECRET=yourBezerkSecret  # Secret for Bezerk. Leave blank if not using (it's NOT required).␍
BOT_CREATOR_NAME=TizzySaurus  # Your discord username. Used in certain messages to ping you (@{BOT_CREATOR_NAME}).␍
BOT_TOKEN=yourBotToken  # The token of your bot, retrieved from the Developer Portal.␍
CREATOR_IDS=442244135840382978  # User IDs of the bot developer(s), separated by commas (NO spaces).␍
DISCORD_SUPPORT_SERVER=discord.gg/WYTxVjzHnc  # Discord invite for your support server. Used in a number of message ouputs. Currently required.␍
DISCORD_WEBHOOK_URL=yourWebhookUrl  # Webhook URL that's used for sending certain dev-logs to Discord.␍
ENABLE_TEXT_COMMANDS=true  # Whether to allow users to utilise prefix/text commands. 'true' or 'false'. Recommend true.␍
GLOBAL_BOT_PREFIX=%  # Prefix to use for prefix/text commands.␍
MESSAGE_BATCH_SIZE=100  # How many messages to store in 'cache' before dumping into database. Defaults to 1000.␍
MESSAGE_HISTORY_DAYS=2  # Maximum age of messages stored in the database. Note that you have to manually setup clearing, e.g. via pg_cron https://github.com/citusdata/pg_cron.␍
PASTE_SITE_ROOT_URL=https://my-paste-site.com  # URL of your selfhosted [haste-server](https://github.com/toptal/haste-server). Used in archive commands and messageDeleteBulk event.␍
PASTE_SITE_TOKEN=yourHasteServerToken  # Optional token to pass in the Authorization header of requests to your self-hosted haste-server.␍
PGDATABASE=logger  # Name of the database that data is stored within.␍
PGHOST=localhost  # Server that PostgreSQL is running on.␍
PGPASSWORD=postgresPassword  # Password of the `PGUSER` user.␍
PGPORT=5432  # Port that PostgreSQL is running on. Defaults to 5432.␍
PGUSER=postgresUsername  # Name of the user (role) to use when connecting to the database.␍
RAVEN_URI=sentryUri  # Sentry URI obtained from sentry.io. Leave blank if not using sentry.␍
REDIS_LOCK_TTL=2000  # Time to Live (TTL) for Redis requests.␍
STAT_SUBMISSION_INTERVAL=  # How often to submit stats to Zabbix. Leave blank to not submit stats.␍
ZABBIX_HOST=  # Server that Zabbix is running on. Leave blank if not submitting stats.

```

While it is recommended to fill out all fields, it is not necessary (AS I HAVE OBSERVED THUS FAR).
Fill in the fields with the values you've gathered.

Here is my configuration for reference:
```
AES_KEY=  # The key used for AES encryption. Can be any ASCII string of any length.
BEZERK_URI= 
BEZERK_SECRET= 
BOT_CREATOR_NAME=removed for security  # Your discord username. Used in certain messages to ping you (@{BOT_CREATOR_NAME}).
BOT_TOKEN=removed for security 
CREATOR_IDS=removed for security # User IDs of the bot developer(s), separated by commas (NO spaces).
DISCORD_SUPPORT_SERVER=discord.gg/WYTxVjzHnc  # Discord invite for your support server. Used in a number of message ouputs. Currently required.
DISCORD_WEBHOOK_URL=
ENABLE_TEXT_COMMANDS=true  # Whether to allow users to utilise prefix/text commands. 'true' or 'false'. Recommend true.
GLOBAL_BOT_PREFIX=%  # Prefix to use for prefix/text commands.
MESSAGE_BATCH_SIZE=100  # How many messages to store in 'cache' before dumping into database. Defaults to 1000.
MESSAGE_HISTORY_DAYS=2  # Maximum age of messages stored in the database. Note that you have to manually setup clearing, e.g. via pg_cron https://github.com/citusdata/pg_cron.
PASTE_SITE_ROOT_URL=http://localhost:7777 # If you have followed the "Optional Dependencies" section, make sure you add this line 
PASTE_SITE_TOKEN=  # Optional token to pass in the Authorization header of requests to your self-hosted haste-server.
PGDATABASE=logger  # Name of the database that data is stored within.
PGHOST=localhost  # Server that PostgreSQL is running on.
PGPASSWORD=$PASTE_YOUR_POSTGRESQL_PASSWORD_HERE  # Password of the `PGUSER` user.
PGPORT=5432  # Port that PostgreSQL is running on. Defaults to 5432.
PGUSER=logger  # Name of the user (role) to use when connecting to the database.
RAVEN_URI= # Sentry URI obtained from sentry.io. Leave blank if not using sentry.
REDIS_LOCK_TTL=2000  # Time to Live (TTL) for Redis requests.
STAT_SUBMISSION_INTERVAL=  # How often to submit stats to Zabbix. Leave blank to not submit stats.
ZABBIX_HOST=  # Server that Zabbix is running on. Leave blank if not submitting stats.
```

Next run `npm install`.
Then `node src/miscellaneous/generateDB.js` to generate the postgres database. Finally, run `node index.js` to start the server.

If everything went smoothly, your application in your server should be online now.

Quoted directly from the original fork
> Use your prefix to set the bot's commands. If yours is %, then you'd do `%setcmd global` to globally set commands, and `%setcmd guild` to quickly set server-specific slash commands

And now you are done... if you don't mind starting the bot manually every time you turn on your server.

If you want it to start every time the server starts follow the next (and final) section.

## Systemd configuration
First, move your working directory (this repository) to /opt/logger-bot.
```
$ mv $PATH_TO_LOCAL_REPOSITORY /opt/logger-bot
```

Create a new user called 'logger' and configure them.
```
$ sudo useradd logger
$ sudo usermod -d /opt/logger-bot 
$ sudo usermod -s /usr/bin/nologin
```

Create the file '/etc/systemd/system/logger-bot.service' and paste this into the file.
```
[Unit]
Description=Logger Discord Bot

[Service]
Type=oneshot
User=logger
WorkingDirectory=/opt/logger
ExecStart=/usr/bin/node index.js

[Install]
WantedBy=multi-user.target
```

Finally execute:
```
$ sudo systemctl enable --now  logger-bot.service
```

Now the bot should start as the system boots.

## Afterword
This is my first time writing a guide so I am bound to mess up a number of things. If you come across an issue, or just have a suggestion on how a step could be preformed better, make a pull request and let met know.
