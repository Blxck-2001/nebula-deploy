package com.nebula.worker.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String DEPLOY_QUEUE = "deploys";
    public static final String DEPLOY_EXCHANGE = "deploys-exchange";
    public static final String DEPLOY_ROUTING = "deploy.new";

    @Bean
    public Queue deployQueue() { return new Queue(DEPLOY_QUEUE, true); }

    @Bean
    public TopicExchange deployExchange() { return new TopicExchange(DEPLOY_EXCHANGE); }

    @Bean
    public Queue deployDlqQueue() { return new Queue(DEPLOY_QUEUE + "-dlq", true); }

    @Bean
    public Jackson2JsonMessageConverter jackson2Converter() { return new Jackson2JsonMessageConverter(); }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory cf) {
        SimpleRabbitListenerContainerFactory f = new SimpleRabbitListenerContainerFactory();
        f.setConnectionFactory(cf);
        f.setMessageConverter(jackson2Converter());
        return f;
    }

    @Bean
    public org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate(ConnectionFactory cf) {
        org.springframework.amqp.rabbit.core.RabbitTemplate t = new org.springframework.amqp.rabbit.core.RabbitTemplate(cf);
        t.setMessageConverter(jackson2Converter());
        return t;
    }
}
