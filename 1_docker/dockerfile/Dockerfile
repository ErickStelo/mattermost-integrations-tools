FROM debian:stretch
LABEL descryption="debian/metoolsapi" version='1.0.0'

SHELL [ "/bin/bash", "-c" ]

WORKDIR /opt

# Set language and environment
RUN sed -i 's/stable\/updates/stable-security\/updates/' /etc/apt/sources.list
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y locales locales-all wget git nano curl cron apt-transport-https
RUN locale-gen pt_BR.utf8
ENV LC_ALL pt_BR.utf8
ENV LANG pt_BR.utf8
ENV LANGUAGE pt_BR.utf8
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install Node
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs
RUN npm install -g pm2@5.2.0

# Clone project
RUN git clone https://erickstelo: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@github.com/ErickStelo/metools-api.git

# Install Zabbix Sender
# RUN wget --no-check-certificate https://repo.zabbix.com/zabbix/6.0/debian/pool/main/z/zabbix-release/zabbix-release_6.0-1+debian9_all.deb
RUN dpkg -i --force-overwrite /opt/metools-api/1_docker/aux/zabbix-release_6.0-1+debian9_all.deb
RUN apt update
RUN apt install -y zabbix-sender
# RUN zabbix_sender -z 172.31.0.190 -s "coroty-api" -k status -o "asdasdasd" -vv


RUN chmod +x /opt/metools-api/1_docker/aux/entrypoint.sh
CMD /opt/metools-api/1_docker/aux/entrypoint.sh


