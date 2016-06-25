export const getServiceName = (variable, objective, time, model) => {
    var serviceName = 'west1_';

    if (objective === 'sites') {
        return serviceName + '1961_1990Y_' + variable;
    }
    else {
        if (time !== '1961_1990' && time !== '1981_2010') {
            serviceName += model + '_';
        }

        return serviceName + time + 'Y_' + variable;
    }
}
