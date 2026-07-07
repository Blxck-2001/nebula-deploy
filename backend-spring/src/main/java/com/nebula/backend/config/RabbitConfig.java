package com.nebula.backend.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String DEPLOY_QUEUE = "deploys";
    public static final String DEPLOY_EXCHANGE = "deploys-exchange";
    public static final String DEPLOY_ROUTING = "deploy.new";

    @Bean
    public Queue deployQueue() {
        return new Queue(DEPLOY_QUEUE, true);
    }

    @Bean
    public TopicExchange deployExchange() {
        return new TopicExchange(DEPLOY_EXCHANGE);
    }

    @Bean
    public Binding binding(Queue deployQueue, TopicExchange deployExchange) {
        return BindingBuilder.bind(deployQueue).to(deployExchange).with(DEPLOY_ROUTING);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }
}
