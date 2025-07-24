FROM mcr.microsoft.com/mssql/server:2022-latest

ENV ACCEPT_EULA=Y

USER root

# Cài mssql-tools
RUN apt-get update && \
    apt-get install -y curl gnupg apt-transport-https unixodbc-dev && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools && \
    ln -sfn /opt/mssql-tools/bin/* /usr/bin/

# Copy dữ liệu khởi tạo
COPY ./backup/ChatbotToeic.bak /var/opt/mssql/backup/
COPY ./init /init
COPY ./restore.sh /mssql/restore.sh

# Đảm bảo cả 2 script chạy được
RUN chmod +x /init/init.sh /mssql/restore.sh
# Đảm bảo script chạy được
RUN chmod +x /init/init.sh

# Mặc định cổng
EXPOSE 1433

# Khởi chạy với entrypoint riêng
ENTRYPOINT ["/init/init.sh"]
